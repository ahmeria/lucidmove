import { NextResponse } from "next/server";
import { sayfaYetkisiOlanOturum } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

export async function POST(_req: Request, { params }: { params: { id: string; reservationId: string } }) {
  const session = await sayfaYetkisiOlanOturum("/admin/camps");
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const rezervasyon = await db.campReservation.findUnique({
    where: { id: params.reservationId },
    include: { camp: true, user: true },
  });
  if (!rezervasyon || rezervasyon.campId !== params.id) {
    return NextResponse.json({ hata: "Rezervasyon bulunamadı" }, { status: 404 });
  }
  if (rezervasyon.status !== "REZERVE_EDILDI") {
    return NextResponse.json({ hata: "Yalnızca bekleyen rezervasyonlar iptal edilebilir" }, { status: 409 });
  }

  await db.campReservation.update({
    where: { id: rezervasyon.id },
    data: { status: "IPTAL_EDILDI", iptalTarihi: new Date() },
  });
  await logKaydet({
    seviye: "INFO",
    kategori: "kamp",
    aksiyon: "iptal",
    kaynakEtiketi: `${rezervasyon.camp.ad} — ${rezervasyon.user.email}`,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
