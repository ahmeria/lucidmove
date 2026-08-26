import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { odemeSonucunuGetir } from "@/lib/iyzico";

// Iyzico, ödeme tamamlandığında kullanıcıyı bu adrese (callbackUrl) bir
// "token" ile birlikte POST eder. Burada sonucu Iyzico'dan tekrar sorgulayıp
// doğruluyoruz — istemciden gelen veriye asla güvenmiyoruz.
export async function POST(req: Request) {
  try {
    // formData() burada, try içinde: gövdesiz/bozuk bir istek 500 yerine
    // zarifçe yönlensin diye (bkz. camps/webhook ve private-lessons/webhook'ta
    // aynı düzeltme).
    const form = await req.formData();
    const token = form.get("token") as string | null;

    if (!token) {
      return NextResponse.redirect(new URL("/?durum=hata#membership", req.url));
    }

    const sonuc = (await odemeSonucunuGetir(token)) as {
      status?: string;
      paymentStatus?: string;
      basketId?: string;
      conversationId?: string;
      paymentId?: string;
    };

    const abonelikId = sonuc.conversationId;
    if (!abonelikId) {
      return NextResponse.redirect(new URL("/?durum=hata#membership", req.url));
    }

    const basariliMi = sonuc.status === "success" && sonuc.paymentStatus === "SUCCESS";

    // GÜVENLİK: başarısızsa durum ASLA "AKTIF" ya da "IPTAL_EDILDI" olmamalı —
    // aktifUyelikVarMi (lib/uyelik.ts) İPTAL_EDILDI'yi de "dönem sonuna kadar
    // erişim var" sayıyor (gerçek bir iptal, dönem sonuna kadar erişimi
    // korusun diye — bilinçli bir tasarım). Ama checkout sırasında
    // currentPeriodEnd ödeme SONUÇLANMADAN ÖNCE +1 ay/yıl olarak zaten
    // yazılmıştı (bkz. membership/checkout/route.ts) — ödeme hiç
    // başarılı olmasa bile buraya "IPTAL_EDILDI" yazmak, üyeliği hiç
    // ödemeden bir yıla kadar aktif hale getiriyordu (önceden burada
    // bu şekildeydi — düzeltildi). "SUresi_DOLDU" hem aktifUyelikVarMi'nin
    // izin verdiği listede DEĞİL, hem de admin panelde "Süresi doldu"
    // olarak anlamlı şekilde gösteriliyor (bkz. admin/subscriptions/page.tsx).
    await db.subscription.update({
      where: { id: abonelikId },
      data: { status: basariliMi ? "AKTIF" : "SUresi_DOLDU" },
    });

    // Bu aboneliğe ait BEKLEMEDE ödemelerden yalnızca EN SON açılanı
    // güncellenir (updateMany DEĞİL) — camps/private-lessons webhook'larındaki
    // aynı düzeltme: iyzicoPaymentId @unique olduğundan birden fazla satırı
    // aynı değere güncellemek kısıtı ihlal edebilir.
    const bekleyenOdeme = await db.payment.findFirst({
      where: { subscriptionId: abonelikId, durum: "BEKLEMEDE" },
      orderBy: { createdAt: "desc" },
    });
    if (bekleyenOdeme) {
      await db.payment.update({
        where: { id: bekleyenOdeme.id },
        data: { durum: basariliMi ? "BASARILI" : "BASARISIZ", iyzicoPaymentId: sonuc.paymentId },
      });
    }

    return NextResponse.redirect(
      new URL(basariliMi ? "/?durum=basarili#membership" : "/?durum=basarisiz#membership", req.url)
    );
  } catch {
    return NextResponse.redirect(new URL("/?durum=hata#membership", req.url));
  }
}
