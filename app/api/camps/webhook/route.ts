import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { odemeSonucunuGetir } from "@/lib/iyzico";

// Iyzico, ödeme tamamlandığında kullanıcıyı bu adrese bir "token" ile
// birlikte POST eder — bkz. app/api/membership/webhook aynı desen. Sonuç
// Iyzico'dan tekrar sorgulanıp doğrulanıyor, istemciden gelen veriye
// güvenilmiyor.
export async function POST(req: Request) {
  try {
    // formData() burada, try içinde: gövdesiz/bozuk bir istek (ör. yanlışlıkla
    // tetiklenen bir çağrı) formData()'yı reddedebilir — bu, alttaki catch'e
    // düşüp zarifçe yönlendirmek yerine 500 ile patlamasın diye.
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

    const rezervasyonId = sonuc.conversationId;
    if (!rezervasyonId) {
      return NextResponse.redirect(new URL("/?durum=hata", req.url));
    }

    const rezervasyon = await db.campReservation.findUnique({
      where: { id: rezervasyonId },
      include: { camp: { select: { slug: true } } },
    });
    if (!rezervasyon) {
      return NextResponse.redirect(new URL("/?durum=hata", req.url));
    }

    const basariliMi = sonuc.status === "success" && sonuc.paymentStatus === "SUCCESS";

    if (basariliMi) {
      await db.campReservation.update({
        where: { id: rezervasyonId },
        data: { status: "ODENDI", odendiTarihi: new Date() },
      });
    }
    // Başarısızsa kayıt REZERVE_EDILDI olarak bırakılır — mevcut son ödeme
    // tarihi geçerliliğini korur, üye /api/camps/[slug]/pay-existing ile
    // süresi dolmadan tekrar deneyebilir.

    // Bu rezervasyona ait BEKLEMEDE ödemelerden yalnızca EN SON açılanı
    // güncellenir (updateMany DEĞİL) — üye "pay-existing" ile birden fazla kez
    // denediyse her denemede yeni bir Payment satırı açılıyor (bkz. o route),
    // hepsini aynı iyzicoPaymentId ile güncellemek unique kısıtını ihlal eder.
    const bekleyenOdeme = await db.payment.findFirst({
      where: { campReservationId: rezervasyonId, durum: "BEKLEMEDE" },
      orderBy: { createdAt: "desc" },
    });
    if (bekleyenOdeme) {
      await db.payment.update({
        where: { id: bekleyenOdeme.id },
        data: { durum: basariliMi ? "BASARILI" : "BASARISIZ", iyzicoPaymentId: sonuc.paymentId },
      });
    }

    return NextResponse.redirect(
      new URL(`/camps/${rezervasyon.camp.slug}?durum=${basariliMi ? "basarili" : "basarisiz"}`, req.url)
    );
  } catch {
    return NextResponse.redirect(new URL("/?durum=hata", req.url));
  }
}
