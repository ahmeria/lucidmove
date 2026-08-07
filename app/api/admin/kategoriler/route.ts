import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { logKaydet } from "@/lib/systemLog";

const kategoriSemasi = z.object({
  ad: z.string().min(2),
  slug: z.string().min(2).optional(),
  aciklama: z.string().optional(),
  sira: z.number().int(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = kategoriSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { ad, aciklama, sira } = govde.data;
  const slug = govde.data.slug ? slugifyTr(govde.data.slug) : slugifyTr(ad);

  try {
    const kategori = await db.category.create({
      data: { ad, slug, aciklama: aciklama || null, sira },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "kategori",
      aksiyon: "olustur",
      kaynakEtiketi: kategori.ad,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, kategori });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Kategori oluşturulamadı" }, { status: 500 });
  }
}
