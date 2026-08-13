import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { derslerinSirasiniYenile } from "@/lib/dersler";
import { dersVideoYoluSemasi } from "@/lib/video";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { dersVideosunuFiligranla } from "@/lib/filigran";
import { logKaydet } from "@/lib/systemLog";

const dersSemasi = z.object({
  baslik: z.string().min(2),
  slug: z.string().min(2).optional(),
  aciklama: z.string().optional(),
  kapakUrl: gorselUrlSemasiOpsiyonel,
  sureDakika: z.number().int().positive(),
  kaynakVideoUrl: dersVideoYoluSemasi,
  ucretsizMi: z.boolean().default(false),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = dersSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, aciklama, kapakUrl, sureDakika, kaynakVideoUrl, ucretsizMi } = govde.data;
  const slug = govde.data.slug ? slugifyTr(govde.data.slug) : slugifyTr(baslik);

  try {
    const ders = await db.lesson.create({
      data: {
        courseId: params.id,
        baslik,
        slug,
        aciklama: aciklama || null,
        kapakUrl: kapakUrl || null,
        sureDakika,
        kaynakVideoUrl,
        filigranDurumu: "ISLENIYOR",
        ucretsizMi,
        sira: 9999,
      },
    });
    await derslerinSirasiniYenile(params.id);

    // Fire-and-forget — yanıtı bloklamadan arka planda filigranla.
    dersVideosunuFiligranla(ders.id, kaynakVideoUrl);

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
