import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

const galeriSemasi = z.object({
  url: z.string().min(1),
  alt: z.string().max(255).optional().or(z.literal("")),
  sira: z.number().int(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = galeriSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  try {
    await db.galeriGorseli.update({
      where: { id: params.id },
      data: { ...govde.data, alt: govde.data.alt || null },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "galeri",
      aksiyon: "guncelle",
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true });
  } catch {
    return NextResponse.json({ hata: "Görsel güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  await db.galeriGorseli.delete({ where: { id: params.id } });
  await logKaydet({
    seviye: "INFO",
    kategori: "galeri",
    aksiyon: "sil",
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
