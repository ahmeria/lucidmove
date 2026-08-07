import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// Not: Bu iskelet Iyzico'nun tek seferlik "Checkout Form" akışını kullanır,
// otomatik yenilenen bir abonelik (recurring) değildir — bu yüzden "iptal"
// burada sadece bir sonraki dönemde yeniden ödeme istemeyeceğinizi işaretler;
// mevcut dönem sonuna kadar erişiminiz devam eder. Gerçek otomatik yenilemeli
// bir abonelik için Iyzico'nun ayrı "Abonelik" (Subscription) API'si gerekir.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ hata: "Giriş yapmalısınız" }, { status: 401 });
  }

  const abonelik = await db.subscription.findFirst({
    where: { userId: session.user.id, status: "AKTIF" },
    orderBy: { createdAt: "desc" },
  });

  if (!abonelik) {
    return NextResponse.json({ hata: "Aktif bir üyelik bulunamadı" }, { status: 404 });
  }

  await db.subscription.update({
    where: { id: abonelik.id },
    data: { status: "IPTAL_EDILDI", cancelledAt: new Date() },
  });
  await logKaydet({
    seviye: "INFO",
    kategori: "uyelik",
    aksiyon: "iptal",
    kaynakEtiketi: session.user.email || undefined,
    userId: session.user.id,
    kullaniciEtiketi: session.user.email,
  });

  return NextResponse.json({ basarili: true });
}
