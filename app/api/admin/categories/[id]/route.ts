import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { logKaydet } from "@/lib/systemLog";

// Slug artık istemciden alınmıyor — admin panelinde ayrı bir alanı yok,
// addan otomatik türetiliyor (bkz. app/admin/categories/KategoriForm.tsx).
const kategoriSemasi = z.object({
  ad: z.string().min(2),
  aciklama: z.string().optional(),
  sira: z.number().int(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const bagliKursSayisi = await db.course.count({ where: { categoryId: params.id } });
  return NextResponse.json({ bagliKursSayisi });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = kategoriSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { ad, aciklama, sira } = govde.data;
  const slug = slugifyTr(ad);

  try {
    const kategori = await db.category.update({
      where: { id: params.id },
      data: { ad, slug, aciklama: aciklama || null, sira },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "kategori",
      aksiyon: "guncelle",
      kaynakEtiketi: kategori.ad,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, kategori });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Kategori güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  // Bağlı kurslar Course.categoryId onDelete: SetNull olduğu için silindiğinde
  // "kategorisiz" kalır — veri kaybı yok, sadece kategori bağlantısı çözülür.
  const silinen = await db.category.delete({ where: { id: params.id } });
  await logKaydet({
    seviye: "INFO",
    kategori: "kategori",
    aksiyon: "sil",
    kaynakEtiketi: silinen.ad,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
