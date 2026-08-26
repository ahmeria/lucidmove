import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { odemeFormuBaslat } from "@/lib/iyzico";
import { hizSiniriniKontrolEt } from "@/lib/rateLimit";

const ODEME_LIMITI = 10;
const ODEME_PENCERESI_MS = 60 * 1000;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ hata: "Devam etmek için giriş yapın" }, { status: 401 });
  }

  // Her başarılı çağrı yeni bir Subscription + Payment satırı + Iyzico
  // isteği oluşturuyor — oturum açmış bir kullanıcının bunu art arda
  // spamlamasına karşı (kullanıcı bazlı, IP değil — IP kolayca sahtelenebilir).
  if (!hizSiniriniKontrolEt(`odeme:${session.user.id}`, ODEME_LIMITI, ODEME_PENCERESI_MS)) {
    return NextResponse.json({ hata: "Çok fazla deneme, lütfen biraz sonra tekrar deneyin" }, { status: 429 });
  }

  let govde: { plan?: "AYLIK" | "YILLIK" };
  try {
    govde = await req.json();
  } catch {
    return NextResponse.json({ hata: "Geçersiz istek" }, { status: 400 });
  }
  const { plan } = govde;
  if (plan !== "AYLIK" && plan !== "YILLIK") {
    return NextResponse.json({ hata: "Geçersiz plan" }, { status: 400 });
  }

  const kullanici = await db.user.findUnique({ where: { id: session.user.id } });
  if (!kullanici) {
    return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const fiyatPlani = await db.pricingPlan.findUnique({ where: { plan } });
  if (!fiyatPlani) {
    return NextResponse.json(
      { hata: "Fiyat planı bulunamadı, lütfen yönetici ile iletişime geçin" },
      { status: 500 }
    );
  }
  const fiyat = fiyatPlani.fiyat.toString();

  // Bekleyen bir abonelik kaydı oluştur — ödeme onaylanınca webhook bunu AKTIF yapar.
  const periyotSonu = new Date();
  if (plan === "AYLIK") periyotSonu.setMonth(periyotSonu.getMonth() + 1);
  else periyotSonu.setFullYear(periyotSonu.getFullYear() + 1);

  const abonelik = await db.subscription.create({
    data: {
      userId: kullanici.id,
      plan,
      status: "BEKLEMEDE",
      currentPeriodEnd: periyotSonu,
    },
  });

  await db.payment.create({
    data: {
      userId: kullanici.id,
      subscriptionId: abonelik.id,
      tutar: fiyat,
      durum: "BEKLEMEDE",
    },
  });

  try {
    const sonuc = (await odemeFormuBaslat({
      conversationId: abonelik.id,
      plan,
      fiyat,
      kullanici: { id: kullanici.id, ad: kullanici.ad, email: kullanici.email },
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/membership/webhook`,
    })) as { checkoutFormContent?: string; paymentPageUrl?: string; status?: string; errorMessage?: string };

    if (sonuc.status !== "success") {
      return NextResponse.json({ hata: sonuc.errorMessage || "Ödeme başlatılamadı" }, { status: 502 });
    }

    return NextResponse.json({
      checkoutFormContent: sonuc.checkoutFormContent,
      paymentPageUrl: sonuc.paymentPageUrl,
    });
  } catch {
    return NextResponse.json({ hata: "Iyzico ile bağlantı kurulamadı" }, { status: 502 });
  }
}
