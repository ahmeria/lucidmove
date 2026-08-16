import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { videoUrlSemasiOpsiyonel } from "@/lib/video";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

// Slug artık istemciden alınmıyor — admin panelinde ayrı bir alanı yok,
// başlıktan otomatik türetiliyor (bkz. app/admin/courses/KursForm.tsx).
// Sıra da istemciden alınmıyor — kurs listesinde sürükle-bırakla belirleniyor
// (bkz. app/admin/courses/KursListesi.tsx), yeni kurs listenin en sonuna eklenir.
const cevSemasi = z.string().optional();

const kursSemasi = z.object({
  baslik: z.string().min(2),
  baslikEn: cevSemasi,
  baslikAz: cevSemasi,
  aciklama: z.string().min(2),
  aciklamaEn: cevSemasi,
  aciklamaAz: cevSemasi,
  seviye: z.string().min(2),
  seviyeEn: cevSemasi,
  seviyeAz: cevSemasi,
  kapakUrl: gorselUrlSemasiOpsiyonel,
  tanitimVideoUrl: videoUrlSemasiOpsiyonel,
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = kursSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, baslikEn, baslikAz, aciklama, aciklamaEn, aciklamaAz, seviye, seviyeEn, seviyeAz, kapakUrl, tanitimVideoUrl } =
    govde.data;
  const slug = slugifyTr(baslik);
  const { _max } = await db.course.aggregate({ _max: { sira: true } });
  const sira = (_max.sira ?? 0) + 1;

  try {
    const kurs = await db.course.create({
      data: {
        baslik,
        baslikEn: baslikEn || null,
        baslikAz: baslikAz || null,
        slug,
        aciklama,
        aciklamaEn: aciklamaEn || null,
        aciklamaAz: aciklamaAz || null,
        seviye,
        seviyeEn: seviyeEn || null,
        seviyeAz: seviyeAz || null,
        kapakUrl: kapakUrl || null,
        tanitimVideoUrl: tanitimVideoUrl || null,
        sira,
      },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "kurs",
      aksiyon: "olustur",
      kaynakEtiketi: kurs.baslik,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, kurs });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Kurs oluşturulamadı" }, { status: 500 });
  }
}
