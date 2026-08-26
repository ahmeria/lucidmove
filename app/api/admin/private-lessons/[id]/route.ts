import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { videoUrlSemasiOpsiyonel } from "@/lib/video";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

const cevSemasi = z.string().optional();

const ozelDersSemasi = z.object({
  baslik: z.string().min(2),
  baslikEn: cevSemasi,
  baslikAz: cevSemasi,
  aciklama: z.string().min(2),
  aciklamaEn: cevSemasi,
  aciklamaAz: cevSemasi,
  kapakUrl: gorselUrlSemasiOpsiyonel,
  tanitimVideoUrl: videoUrlSemasiOpsiyonel,
  fiyat: z.coerce.number().min(0),
  yayindaMi: z.boolean().default(true),
});

// Düzenleme ekranındaki "Satın alanları görüntüle" linki + silme öncesi
// uyarı için — bkz. app/api/admin/camps/[id]/route.ts'teki aynı gerekçe.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const satinAlmaSayisi = await db.privateLessonPurchase.count({ where: { privateLessonId: params.id } });
  return NextResponse.json({ satinAlmaSayisi });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = ozelDersSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, baslikEn, baslikAz, aciklama, aciklamaEn, aciklamaAz, kapakUrl, tanitimVideoUrl, fiyat, yayindaMi } =
    govde.data;
  const slug = slugifyTr(baslik);

  try {
    const ders = await db.privateLesson.update({
      where: { id: params.id },
      data: {
        baslik,
        baslikEn: baslikEn || null,
        baslikAz: baslikAz || null,
        slug,
        aciklama,
        aciklamaEn: aciklamaEn || null,
        aciklamaAz: aciklamaAz || null,
        kapakUrl: kapakUrl || null,
        tanitimVideoUrl: tanitimVideoUrl || null,
        fiyat,
        yayindaMi,
      },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "ozel-ders",
      aksiyon: "guncelle",
      kaynakEtiketi: ders.baslik,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, ders });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Özel ders güncellenemedi" }, { status: 500 });
  }
}

// Özel ders silinince ilişkili PrivateLessonVideo/PrivateLessonPurchase
// kayıtları CASCADE ile silinir; onlara bağlı Payment satırları SetNull ile
// hayatta kalır — finansal kayıt korunur.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const silinen = await db.privateLesson.delete({ where: { id: params.id } });
  await logKaydet({
    seviye: "INFO",
    kategori: "ozel-ders",
    aksiyon: "sil",
    kaynakEtiketi: silinen.baslik,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
