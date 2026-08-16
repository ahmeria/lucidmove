import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

// "ad" (görünen etiket) değişebilir ama "slug" BİLEREK bu şemada YOK —
// Lesson.mood bu değere göre serbestçe eşleşiyor (FK değil), slug değişirse
// mevcut ders etiketlemeleri sessizce kopardı (bkz. prisma/schema.prisma >
// Mood notu). Ad değişse de slug hep aynı kalır.
const moodSemasi = z.object({
  ad: z.string().min(2).max(100),
  adEn: z.string().optional(),
  adAz: z.string().optional(),
  gorselUrl: gorselUrlSemasiOpsiyonel,
  sira: z.number().int(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = moodSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }
  const { ad, adEn, adAz, gorselUrl, sira } = govde.data;

  try {
    await db.mood.update({
      where: { id: params.id },
      data: { ad, adEn: adEn || null, adAz: adAz || null, gorselUrl: gorselUrl || null, sira },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "mood",
      aksiyon: "guncelle",
      kaynakEtiketi: ad,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true });
  } catch {
    return NextResponse.json({ hata: "Mood güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const silinen = await db.mood.delete({ where: { id: params.id } });
  await logKaydet({
    seviye: "INFO",
    kategori: "mood",
    aksiyon: "sil",
    kaynakEtiketi: silinen.ad,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
