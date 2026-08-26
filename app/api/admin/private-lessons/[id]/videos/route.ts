import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { ozelDersVideolarininSirasiniYenile } from "@/lib/ozelDersler";
import { dersVideoYoluSemasi } from "@/lib/video";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

// bkz. app/api/admin/courses/[id]/lessons/route.ts — birebir aynı desen,
// mood/ucretsizMi alanları yok (özel ders videoları kurs kataloğu filtre
// sistemine dahil değil, önizleme istenmedi).
const cevSemasi = z.string().optional();

const videoSemasi = z.object({
  baslik: z.string().min(2),
  baslikEn: cevSemasi,
  baslikAz: cevSemasi,
  slug: z.string().min(2).optional(),
  aciklama: z.string().optional(),
  aciklamaEn: cevSemasi,
  aciklamaAz: cevSemasi,
  kapakUrl: gorselUrlSemasiOpsiyonel,
  sureDakika: z.number().int().positive(),
  videoUrl: dersVideoYoluSemasi,
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = videoSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, baslikEn, baslikAz, aciklama, aciklamaEn, aciklamaAz, kapakUrl, sureDakika, videoUrl } = govde.data;
  const slug = govde.data.slug ? slugifyTr(govde.data.slug) : slugifyTr(baslik);

  try {
    const video = await db.privateLessonVideo.create({
      data: {
        privateLessonId: params.id,
        baslik,
        baslikEn: baslikEn || null,
        baslikAz: baslikAz || null,
        slug,
        aciklama: aciklama || null,
        aciklamaEn: aciklamaEn || null,
        aciklamaAz: aciklamaAz || null,
        kapakUrl: kapakUrl || null,
        sureDakika,
        videoUrl,
        sira: 9999,
      },
    });
    await ozelDersVideolarininSirasiniYenile(params.id);

    await logKaydet({
      seviye: "INFO",
      kategori: "ozel-ders",
      aksiyon: "olustur",
      kaynakEtiketi: video.baslik,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Video oluşturulamadı" }, { status: 500 });
  }
}
