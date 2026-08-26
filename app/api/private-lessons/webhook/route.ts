import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { odemeSonucunuGetir } from "@/lib/iyzico";

// bkz. app/api/camps/webhook — aynı iki düzeltme burada da uygulanıyor:
// (1) formData() try/catch İÇİNDE (boşgövdeli istek 500 yerine zarifçe
// yönlensin diye), (2) ilgili Payment satırı updateMany DEĞİL, en son
// BEKLEMEDE kayıt ID'siyle güncelleniyor (iyzicoPaymentId'nin unique
// kısıtını ihlal etmemek için — birden fazla deneme birikmiş olabilir).
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const token = form.get("token") as string | null;

    if (!token) {
      return NextResponse.redirect(new URL("/?durum=hata", req.url));
    }

    const sonuc = (await odemeSonucunuGetir(token)) as {
      status?: string;
      paymentStatus?: string;
      conversationId?: string;
      paymentId?: string;
    };

    const satinAlmaId = sonuc.conversationId;
    if (!satinAlmaId) {
      return NextResponse.redirect(new URL("/?durum=hata", req.url));
    }

    const satinAlma = await db.privateLessonPurchase.findUnique({
      where: { id: satinAlmaId },
      include: { privateLesson: { select: { slug: true } } },
    });
    if (!satinAlma) {
      return NextResponse.redirect(new URL("/?durum=hata", req.url));
    }

    const basariliMi = sonuc.status === "success" && sonuc.paymentStatus === "SUCCESS";

    if (basariliMi) {
      await db.privateLessonPurchase.update({
        where: { id: satinAlmaId },
        data: { status: "ODENDI", odendiTarihi: new Date() },
      });
    }
    // Başarısızsa BEKLEMEDE bırakılır — üye /api/private-lessons/[slug]/purchase
    // ile tekrar deneyebilir (upsert aynı kaydı yeniden kullanır).

    const bekleyenOdeme = await db.payment.findFirst({
      where: { privateLessonPurchaseId: satinAlmaId, durum: "BEKLEMEDE" },
      orderBy: { createdAt: "desc" },
    });
    if (bekleyenOdeme) {
      await db.payment.update({
        where: { id: bekleyenOdeme.id },
        data: { durum: basariliMi ? "BASARILI" : "BASARISIZ", iyzicoPaymentId: sonuc.paymentId },
      });
    }

    return NextResponse.redirect(
      new URL(`/private-lessons/${satinAlma.privateLesson.slug}?durum=${basariliMi ? "basarili" : "basarisiz"}`, req.url)
    );
  } catch {
    return NextResponse.redirect(new URL("/?durum=hata", req.url));
  }
}
