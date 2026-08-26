import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ozelDersOdemeFormuBaslat } from "@/lib/iyzico";

// Kamplardan farklı olarak burada kapasite/rezervasyon kavramı yok — tek bir
// idempotent uç hem ilk satın almayı hem yarım kalmış bir denemenin tekrarını
// karşılar (bkz. plan). Gövde gerekmiyor (mod seçimi yok, tek aksiyon var).
export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ hata: "Devam etmek için giriş yapın" }, { status: 401 });
  }

  const ders = await db.privateLesson.findUnique({ where: { slug: params.slug } });
  if (!ders || !ders.yayindaMi) {
    return NextResponse.json({ hata: "Özel ders bulunamadı" }, { status: 404 });
  }

  const kullanici = await db.user.findUnique({ where: { id: session.user.id } });
  if (!kullanici) {
    return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  let satinAlma;
  try {
    satinAlma = await db.$transaction(
      async (tx) => {
        // Mevcut BEKLEMEDE bir kayıt varsa yeniden kullanılır (update:{} no-op);
        // hiç yoksa oluşturulur. Zaten ODENDI ise aşağıda reddedilir.
        const kayit = await tx.privateLessonPurchase.upsert({
          where: { privateLessonId_userId: { privateLessonId: ders.id, userId: kullanici.id } },
          create: { privateLessonId: ders.id, userId: kullanici.id },
          update: {},
        });
        if (kayit.status === "ODENDI") throw new Error("ZATEN_SATIN_ALINDI");

        await tx.payment.create({
          data: { userId: kullanici.id, privateLessonPurchaseId: kayit.id, tutar: ders.fiyat, durum: "BEKLEMEDE" },
        });
        return kayit;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034") {
      return NextResponse.json({ hata: "Yoğun talep nedeniyle işlem tamamlanamadı, lütfen tekrar deneyin" }, { status: 409 });
    }
    if (e instanceof Error && e.message === "ZATEN_SATIN_ALINDI") {
      return NextResponse.json({ hata: "Bu özel dersi zaten satın aldınız" }, { status: 409 });
    }
    return NextResponse.json({ hata: "İşlem başlatılamadı, lütfen tekrar deneyin" }, { status: 409 });
  }

  try {
    const sonuc = (await ozelDersOdemeFormuBaslat({
      conversationId: satinAlma.id,
      fiyat: ders.fiyat.toString(),
      ders: { id: ders.id, baslik: ders.baslik },
      kullanici: { id: kullanici.id, ad: kullanici.ad, email: kullanici.email },
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/private-lessons/webhook`,
    })) as { checkoutFormContent?: string; paymentPageUrl?: string; status?: string; errorMessage?: string };

    if (sonuc.status !== "success") {
      return NextResponse.json({ hata: sonuc.errorMessage || "Ödeme başlatılamadı" }, { status: 502 });
    }

    return NextResponse.json({ checkoutFormContent: sonuc.checkoutFormContent, paymentPageUrl: sonuc.paymentPageUrl });
  } catch {
    return NextResponse.json({ hata: "Iyzico ile bağlantı kurulamadı" }, { status: 502 });
  }
}
