import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { odemeFormuBaslat } from "@/lib/iyzico";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ hata: "Devam etmek için giriş yapın" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: "AYLIK" | "YILLIK" };
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
