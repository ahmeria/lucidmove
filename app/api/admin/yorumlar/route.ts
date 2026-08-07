import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

const yorumSemasi = z.object({
  isim: z.string().min(2).max(100),
  rol: z.string().min(2).max(100),
  yorum: z.string().min(5).max(1000),
  sira: z.number().int(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = yorumSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const yorum = await db.testimonial.create({ data: govde.data });
  await logKaydet({
    seviye: "INFO",
    kategori: "yorum",
    aksiyon: "olustur",
    kaynakEtiketi: yorum.isim,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true, yorum });
}
