import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { odemeSonucunuGetir } from "@/lib/iyzico";

// Iyzico, ödeme tamamlandığında kullanıcıyı bu adrese (callbackUrl) bir
// "token" ile birlikte POST eder. Burada sonucu Iyzico'dan tekrar sorgulayıp
// doğruluyoruz — istemciden gelen veriye asla güvenmiyoruz.
export async function POST(req: Request) {
  const form = await req.formData();
  const token = form.get("token") as string | null;

  if (!token) {
    return NextResponse.redirect(new URL("/?durum=hata#membership", req.url));
  }

  try {
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

    await db.subscription.update({
      where: { id: abonelikId },
      data: { status: basariliMi ? "AKTIF" : "IPTAL_EDILDI" },
    });

    await db.payment.updateMany({
      where: { subscriptionId: abonelikId },
      data: {
        durum: basariliMi ? "BASARILI" : "BASARISIZ",
        iyzicoPaymentId: sonuc.paymentId,
      },
    });

    return NextResponse.redirect(
      new URL(basariliMi ? "/?durum=basarili#membership" : "/?durum=basarisiz#membership", req.url)
    );
  } catch {
    return NextResponse.redirect(new URL("/?durum=hata#membership", req.url));
  }
}
