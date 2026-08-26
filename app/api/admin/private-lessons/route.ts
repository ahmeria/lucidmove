import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { videoUrlSemasiOpsiyonel } from "@/lib/video";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

// Slug istemciden alınmıyor — admin panelinde ayrı bir alanı yok, başlıktan
// otomatik türetiliyor (bkz. app/admin/private-lessons/OzelDersForm.tsx,
// courses'daki aynı desen).
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

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = ozelDersSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, baslikEn, baslikAz, aciklama, aciklamaEn, aciklamaAz, kapakUrl, tanitimVideoUrl, fiyat, yayindaMi } =
    govde.data;
  const slug = slugifyTr(baslik);
  const { _max } = await db.privateLesson.aggregate({ _max: { sira: true } });
  const sira = (_max.sira ?? 0) + 1;

  try {
    const ders = await db.privateLesson.create({
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
        sira,
      },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "ozel-ders",
      aksiyon: "olustur",
      kaynakEtiketi: ders.baslik,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, ders });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Özel ders oluşturulamadı" }, { status: 500 });
  }
}
