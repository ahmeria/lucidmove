import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { odemeSonucunuGetir } from "@/lib/iyzico";
import { logKaydet } from "@/lib/systemLog";

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
      // GÜVENLİK: rezervasyonu körü körüne ODENDI'ye çevirmeden önce GÜNCEL
      // durumunu tekrar oku — ödeme sonuçlanana kadar geçen sürede admin bu
      // rezervasyonu iptal etmiş (bkz. reservations/[reservationId]/cancel)
      // ya da süresi dolup yeri başka birine satılmış olabilir. Bunu
      // kontrol etmeden ODENDI yazmak, admin'in bilerek iptal ettiği bir
      // rezervasyonu sessizce geri açabilir ya da kampı fazla satabilir.
      if (rezervasyon.status === "IPTAL_EDILDI") {
        await logKaydet({
          seviye: "ERROR",
          kategori: "kamp",
          aksiyon: "guncelle",
          kaynakEtiketi: `Rezervasyon ${rezervasyonId} — ${rezervasyon.camp.slug}`,
          mesaj: "İptal edilmiş bir rezervasyon için ödeme başarıyla tamamlandı (yarış durumu) — manuel inceleme/iade gerekebilir.",
        });
        // Admin'in bilerek verdiği iptal kararını sessizce geri almıyoruz —
        // durum İPTAL_EDILDI kalır, para alınmış olabilir; admin log'dan
        // görüp iade/manuel çözüm kararını verir.
      } else {
        const digerDoluSayisi = await db.campReservation.count({
          where: { campId: rezervasyon.campId, id: { not: rezervasyonId }, status: { in: ["REZERVE_EDILDI", "ODENDI"] } },
        });
        if (digerDoluSayisi >= (await db.camp.findUnique({ where: { id: rezervasyon.campId }, select: { kapasite: true } }))!.kapasite) {
          await logKaydet({
            seviye: "ERROR",
            kategori: "kamp",
            aksiyon: "guncelle",
            kaynakEtiketi: `Rezervasyon ${rezervasyonId} — ${rezervasyon.camp.slug}`,
            mesaj: "Ödeme başarıyla tamamlandı ama kontenjan bu arada dolmuş (yarış durumu) — kamp fazla satılmış olabilir, manuel inceleme gerekiyor.",
          });
          // Yine de ODENDI işaretliyoruz — para gerçekten alındı, admin
          // log'dan durumu görüp müşteriyle iletişime geçer (ek yer/iade).
        }
        await db.campReservation.update({
          where: { id: rezervasyonId },
          data: { status: "ODENDI", odendiTarihi: new Date() },
        });
      }
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
