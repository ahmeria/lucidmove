import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// Banka havalesi/elden gibi Iyzico dışı bir ödeme alındığında admin'in
// rezervasyonu elle "ödendi" işaretlemesi için — bkz. app/admin/subscriptions/
// manual-payment'taki aynı amaç. Kamp tek/sabit fiyatlı olduğundan (plan
// seçimi yok) burada ayrı bir form yok, tek tıkla onay yeterli.
export async function POST(_req: Request, { params }: { params: { id: string; reservationId: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const rezervasyon = await db.campReservation.findUnique({
    where: { id: params.reservationId },
    include: { camp: true, user: true },
  });
  if (!rezervasyon || rezervasyon.campId !== params.id) {
    return NextResponse.json({ hata: "Rezervasyon bulunamadı" }, { status: 404 });
  }
  if (rezervasyon.status !== "REZERVE_EDILDI") {
    return NextResponse.json({ hata: "Yalnızca bekleyen rezervasyonlar için işaretlenebilir" }, { status: 409 });
  }

  await db.$transaction([
    db.payment.create({
      data: {
        userId: rezervasyon.userId,
        campReservationId: rezervasyon.id,
        tutar: rezervasyon.camp.fiyat,
        durum: "BASARILI",
      },
    }),
    db.campReservation.update({
      where: { id: rezervasyon.id },
      data: { status: "ODENDI", odendiTarihi: new Date() },
    }),
  ]);

  await logKaydet({
    seviye: "INFO",
    kategori: "kamp",
    aksiyon: "guncelle",
    kaynakEtiketi: `${rezervasyon.camp.ad} — ${rezervasyon.user.email}`,
    mesaj: "Manuel ödeme ile onaylandı",
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
