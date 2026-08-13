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
const kursSemasi = z.object({
  baslik: z.string().min(2),
  aciklama: z.string().min(2),
  seviye: z.string().min(2),
  kapakUrl: gorselUrlSemasiOpsiyonel,
  tanitimVideoUrl: videoUrlSemasiOpsiyonel,
  categoryId: z.string().nullable().optional(),
  sira: z.number().int(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = kursSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, aciklama, seviye, kapakUrl, tanitimVideoUrl, categoryId, sira } = govde.data;
  const slug = slugifyTr(baslik);

  try {
    const kurs = await db.course.create({
      data: {
        baslik,
        slug,
        aciklama,
        seviye,
        kapakUrl: kapakUrl || null,
        tanitimVideoUrl: tanitimVideoUrl || null,
        categoryId: categoryId || null,
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
