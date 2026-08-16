import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { derslerinSirasiniYenile } from "@/lib/dersler";
import { dersVideoYoluSemasi } from "@/lib/video";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

const cevSemasi = z.string().optional();

const dersSemasi = z.object({
  baslik: z.string().min(2),
  baslikEn: cevSemasi,
  baslikAz: cevSemasi,
  slug: z.string().min(2).optional(),
  aciklama: z.string().optional(),
  aciklamaEn: cevSemasi,
  aciklamaAz: cevSemasi,
  kapakUrl: gorselUrlSemasiOpsiyonel,
  sureDakika: z.number().int().positive(),
  kaynakVideoUrl: dersVideoYoluSemasi,
  ucretsizMi: z.boolean().default(false),
  mood: z.string().nullable().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = dersSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, baslikEn, baslikAz, aciklama, aciklamaEn, aciklamaAz, kapakUrl, sureDakika, kaynakVideoUrl, ucretsizMi, mood } =
    govde.data;
  const slug = govde.data.slug ? slugifyTr(govde.data.slug) : slugifyTr(baslik);

  try {
    const ders = await db.lesson.create({
      data: {
        courseId: params.id,
        baslik,
        baslikEn: baslikEn || null,
        baslikAz: baslikAz || null,
        slug,
        aciklama: aciklama || null,
        aciklamaEn: aciklamaEn || null,
        aciklamaAz: aciklamaAz || null,
        kapakUrl: kapakUrl || null,
        sureDakika,
        kaynakVideoUrl,
        // Filigranlama kaldırıldı (bkz. git geçmişi) — yüklenen dosya
        // doğrudan servis ediliyor, ekstra işleme adımı yok.
        videoUrl: kaynakVideoUrl,
        filigranDurumu: "HAZIR",
        ucretsizMi,
        mood: mood || null,
        sira: 9999,
      },
    });
    await derslerinSirasiniYenile(params.id);

    await logKaydet({
      seviye: "INFO",
      kategori: "ders",
      aksiyon: "olustur",
      kaynakEtiketi: ders.baslik,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Ders oluşturulamadı" }, { status: 500 });
  }
}
