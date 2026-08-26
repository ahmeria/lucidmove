import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { kampOdemeFormuBaslat } from "@/lib/iyzico";
import { suresiGecenRezervasyonlariGuncelle } from "@/lib/kamplar";

const ALTMIS_DAKIKA_MS = 60 * 60 * 1000;
const GUN_MS = 24 * 60 * 60 * 1000;

// "Hemen satın al" ve "Rezervasyon yap" aynı uçtan yönetiliyor — kapasite/
// transaction mantığını iki dosyaya bölmemek için (bkz. plan). Tek fark,
// tutulan yerin ödeme için ne kadar süre tanıdığı (sonOdemeTarihi).
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ hata: "Devam etmek için giriş yapın" }, { status: 401 });
  }

  const { mod } = (await req.json()) as { mod?: "SATIN_AL" | "REZERVE_ET" };
  if (mod !== "SATIN_AL" && mod !== "REZERVE_ET") {
    return NextResponse.json({ hata: "Geçersiz istek" }, { status: 400 });
  }

  const kamp = await db.camp.findUnique({ where: { slug: params.slug } });
  if (!kamp || !kamp.yayindaMi) {
    return NextResponse.json({ hata: "Kamp bulunamadı" }, { status: 404 });
  }

  const kullanici = await db.user.findUnique({ where: { id: session.user.id } });
  if (!kullanici) {
    return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  await suresiGecenRezervasyonlariGuncelle(kamp.id);

  let rezervasyon;
  try {
    rezervasyon = await db.$transaction(
      async (tx) => {
        const mevcut = await tx.campReservation.findFirst({
          where: { campId: kamp.id, userId: kullanici.id, status: { in: ["REZERVE_EDILDI", "ODENDI"] } },
        });
        if (mevcut) throw new Error(mevcut.status === "ODENDI" ? "ZATEN_ODENDI" : "ZATEN_REZERVE");

        const dolu = await tx.campReservation.count({
          where: { campId: kamp.id, status: { in: ["REZERVE_EDILDI", "ODENDI"] } },
        });
        if (dolu >= kamp.kapasite) throw new Error("KONTENJAN_DOLU");

        const sonOdemeTarihi = new Date(
          Date.now() + (mod === "SATIN_AL" ? ALTMIS_DAKIKA_MS : kamp.rezervasyonSuresiGun * GUN_MS)
        );

        const yeni = await tx.campReservation.create({
          data: { campId: kamp.id, userId: kullanici.id, sonOdemeTarihi },
        });
        await tx.payment.create({
          data: { userId: kullanici.id, campReservationId: yeni.id, tutar: kamp.fiyat, durum: "BEKLEMEDE" },
        });
        return yeni;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034") {
      return NextResponse.json({ hata: "Yoğun talep nedeniyle işlem tamamlanamadı, lütfen tekrar deneyin" }, { status: 409 });
    }
    const kod = e instanceof Error ? e.message : "";
    if (kod === "ZATEN_ODENDI") return NextResponse.json({ hata: "Bu kamp için zaten ödeme yaptınız" }, { status: 409 });
    if (kod === "ZATEN_REZERVE")
      return NextResponse.json({ hata: "Bu kamp için zaten bir rezervasyonunuz var" }, { status: 409 });
    if (kod === "KONTENJAN_DOLU") return NextResponse.json({ hata: "Kontenjan dolu" }, { status: 409 });
    return NextResponse.json({ hata: "Rezervasyon oluşturulamadı, lütfen tekrar deneyin" }, { status: 409 });
  }

  try {
    const sonuc = (await kampOdemeFormuBaslat({
      conversationId: rezervasyon.id,
      fiyat: kamp.fiyat.toString(),
      kamp: { id: kamp.id, ad: kamp.ad },
      kullanici: { id: kullanici.id, ad: kullanici.ad, email: kullanici.email },
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/camps/webhook`,
    })) as { checkoutFormContent?: string; paymentPageUrl?: string; status?: string; errorMessage?: string };

    if (sonuc.status !== "success") {
      return NextResponse.json({ hata: sonuc.errorMessage || "Ödeme başlatılamadı" }, { status: 502 });
    }

    return NextResponse.json({ checkoutFormContent: sonuc.checkoutFormContent, paymentPageUrl: sonuc.paymentPageUrl });
  } catch {
    return NextResponse.json({ hata: "Iyzico ile bağlantı kurulamadı" }, { status: 502 });
  }
}
