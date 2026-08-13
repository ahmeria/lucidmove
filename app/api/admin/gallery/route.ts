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

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = galeriSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const gorsel = await db.galeriGorseli.create({ data: { ...govde.data, alt: govde.data.alt || null } });
  await logKaydet({
    seviye: "INFO",
    kategori: "galeri",
    aksiyon: "olustur",
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true, gorsel });
}
