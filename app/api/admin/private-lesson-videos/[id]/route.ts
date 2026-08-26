import { NextResponse } from "next/server";
import { z } from "zod";
import { sayfaYetkisiOlanOturum } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { ozelDersVideolarininSirasiniYenile } from "@/lib/ozelDersler";
import { dersVideoYoluSemasi } from "@/lib/video";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

// Slug artık istemciden alınmıyor — başlıktan otomatik türetiliyor (bkz.
// app/admin/private-lessons/[id]/edit/OzelDersVideoYonetimi.tsx).
const cevSemasi = z.string().optional();

const videoSemasi = z.object({
  baslik: z.string().min(2),
  baslikEn: cevSemasi,
  baslikAz: cevSemasi,
  aciklama: z.string().optional(),
  aciklamaEn: cevSemasi,
  aciklamaAz: cevSemasi,
  kapakUrl: gorselUrlSemasiOpsiyonel,
  sureDakika: z.number().int().positive(),
  videoUrl: dersVideoYoluSemasi,
  sira: z.number().int(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await sayfaYetkisiOlanOturum("/admin/private-lessons");
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = videoSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, baslikEn, baslikAz, aciklama, aciklamaEn, aciklamaAz, kapakUrl, sureDakika, videoUrl, sira } = govde.data;
  const slug = slugifyTr(baslik);

  try {
    const video = await db.privateLessonVideo.update({
      where: { id: params.id },
      data: {
        baslik,
        baslikEn: baslikEn || null,
        baslikAz: baslikAz || null,
        slug,
        aciklama: aciklama || null,
        aciklamaEn: aciklamaEn || null,
        aciklamaAz: aciklamaAz || null,
        kapakUrl: kapakUrl || null,
        sureDakika,
        sira,
        videoUrl,
      },
    });
    await ozelDersVideolarininSirasiniYenile(video.privateLessonId);

    await logKaydet({
      seviye: "INFO",
      kategori: "ozel-ders",
      aksiyon: "guncelle",
      kaynakEtiketi: video.baslik,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Video güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await sayfaYetkisiOlanOturum("/admin/private-lessons");
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const video = await db.privateLessonVideo.delete({ where: { id: params.id } });
  await ozelDersVideolarininSirasiniYenile(video.privateLessonId);
  await logKaydet({
    seviye: "INFO",
    kategori: "ozel-ders",
    aksiyon: "sil",
    kaynakEtiketi: video.baslik,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
