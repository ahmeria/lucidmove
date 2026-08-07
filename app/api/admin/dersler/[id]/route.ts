import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { derslerinSirasiniYenile } from "@/lib/dersler";
import { dersVideoYoluSemasi } from "@/lib/video";
import { dersVideosunuFiligranla } from "@/lib/filigran";
import { logKaydet } from "@/lib/systemLog";

const dersSemasi = z.object({
  baslik: z.string().min(2),
  slug: z.string().min(2),
  aciklama: z.string().optional(),
  sureDakika: z.number().int().positive(),
  kaynakVideoUrl: dersVideoYoluSemasi,
  ucretsizMi: z.boolean(),
  sira: z.number().int(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = dersSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { baslik, aciklama, sureDakika, kaynakVideoUrl, ucretsizMi, sira } = govde.data;
  const slug = slugifyTr(govde.data.slug);

  try {
    const oncekiDers = await db.lesson.findUnique({ where: { id: params.id }, select: { kaynakVideoUrl: true } });
    const videoDegisti = oncekiDers?.kaynakVideoUrl !== kaynakVideoUrl;

    const ders = await db.lesson.update({
      where: { id: params.id },
      data: {
        baslik,
        slug,
        aciklama: aciklama || null,
        sureDakika,
        ucretsizMi,
        sira,
        kaynakVideoUrl,
        // Video dosyası değiştiyse yeniden filigranlamak gerekir; değişmediyse
        // mevcut filigranlı dosya ve durum aynen kalır.
        ...(videoDegisti && { videoUrl: null, filigranDurumu: "ISLENIYOR" as const }),
      },
    });
    await derslerinSirasiniYenile(ders.courseId);

    if (videoDegisti) {
      dersVideosunuFiligranla(ders.id, kaynakVideoUrl);
    }

    await logKaydet({
      seviye: "INFO",
      kategori: "ders",
      aksiyon: "guncelle",
      kaynakEtiketi: ders.baslik,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Ders güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const ders = await db.lesson.delete({ where: { id: params.id } });
  await derslerinSirasiniYenile(ders.courseId);
  await logKaydet({
    seviye: "INFO",
    kategori: "ders",
    aksiyon: "sil",
    kaynakEtiketi: ders.baslik,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
