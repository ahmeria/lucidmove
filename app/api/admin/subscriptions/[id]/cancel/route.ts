import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const abonelik = await db.subscription.findUnique({ where: { id: params.id }, include: { user: true } });
  if (!abonelik) {
    return NextResponse.json({ hata: "Abonelik bulunamadı" }, { status: 404 });
  }

  await db.subscription.update({
    where: { id: params.id },
    data: { status: "IPTAL_EDILDI", cancelledAt: new Date() },
  });
  await logKaydet({
    seviye: "INFO",
    kategori: "uyelik",
    aksiyon: "iptal",
    kaynakEtiketi: abonelik.user.email,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
