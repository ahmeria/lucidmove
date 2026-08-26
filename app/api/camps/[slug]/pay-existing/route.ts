import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { kampOdemeFormuBaslat } from "@/lib/iyzico";
import { sonRezervasyonuGetir } from "@/lib/kamplar";
import { hizSiniriniKontrolEt } from "@/lib/rateLimit";

const ODEME_LIMITI = 10;
const ODEME_PENCERESI_MS = 60 * 1000;

// Bekleyen (REZERVE_EDILDI, henüz süresi dolmamış) bir rezervasyon için
// yeniden Iyzico ödeme formu başlatır — ör. üye ilk denemede formu
// tamamlamadan çıktıysa. campReservationId unique OLMADIĞI için (bkz.
// prisma/schema.prisma > Payment) bu, aynı rezervasyona yeni bir Payment
// satırı ekleyerek güvenle tekrar denenebilir.
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ hata: "Devam etmek için giriş yapın" }, { status: 401 });
  }

  if (!hizSiniriniKontrolEt(`odeme:${session.user.id}`, ODEME_LIMITI, ODEME_PENCERESI_MS)) {
    return NextResponse.json({ hata: "Çok fazla deneme, lütfen biraz sonra tekrar deneyin" }, { status: 429 });
  }

  const kamp = await db.camp.findUnique({ where: { slug: params.slug } });
  if (!kamp) return NextResponse.json({ hata: "Kamp bulunamadı" }, { status: 404 });

  const kullanici = await db.user.findUnique({ where: { id: session.user.id } });
  if (!kullanici) return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 });

  const rezervasyon = await sonRezervasyonuGetir(kamp.id, kullanici.id);
  if (!rezervasyon || rezervasyon.status !== "REZERVE_EDILDI") {
    return NextResponse.json({ hata: "Tamamlanmamış bir rezervasyonunuz yok" }, { status: 404 });
  }

  await db.payment.create({
    data: { userId: kullanici.id, campReservationId: rezervasyon.id, tutar: kamp.fiyat, durum: "BEKLEMEDE" },
  });

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
