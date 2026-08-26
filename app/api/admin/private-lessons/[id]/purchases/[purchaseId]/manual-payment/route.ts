import { NextResponse } from "next/server";
import { sayfaYetkisiOlanOturum } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// Banka havalesi/elden gibi Iyzico dışı bir ödeme alındığında admin'in satın
// almayı elle "ödendi" işaretlemesi için — bkz. Kamplar'daki manuel-ödeme
// emsali. Rezervasyon/iptal kavramı yok, bu yüzden tek aksiyon bu.
export async function POST(_req: Request, { params }: { params: { id: string; purchaseId: string } }) {
  const session = await sayfaYetkisiOlanOturum("/admin/private-lessons");
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const satinAlma = await db.privateLessonPurchase.findUnique({
    where: { id: params.purchaseId },
    include: { privateLesson: true, user: true },
  });
  if (!satinAlma || satinAlma.privateLessonId !== params.id) {
    return NextResponse.json({ hata: "Satın alma bulunamadı" }, { status: 404 });
  }
  if (satinAlma.status !== "BEKLEMEDE") {
    return NextResponse.json({ hata: "Yalnızca bekleyen satın almalar için işaretlenebilir" }, { status: 409 });
  }

  await db.$transaction([
    db.payment.create({
      data: {
        userId: satinAlma.userId,
        privateLessonPurchaseId: satinAlma.id,
        tutar: satinAlma.privateLesson.fiyat,
        durum: "BASARILI",
      },
    }),
    db.privateLessonPurchase.update({
      where: { id: satinAlma.id },
      data: { status: "ODENDI", odendiTarihi: new Date() },
    }),
  ]);

  await logKaydet({
    seviye: "INFO",
    kategori: "ozel-ders",
    aksiyon: "guncelle",
    kaynakEtiketi: `${satinAlma.privateLesson.baslik} — ${satinAlma.user.email}`,
    mesaj: "Manuel ödeme ile onaylandı",
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
