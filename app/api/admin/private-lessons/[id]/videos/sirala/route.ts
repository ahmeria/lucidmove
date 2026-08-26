import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// bkz. app/api/admin/courses/[id]/lessons/sirala/route.ts — birebir aynı desen.
const semasi = z.object({
  siraliIdler: z.array(z.string()).min(1),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }
  const { siraliIdler } = govde.data;

  // Gönderilen liste, gerçekten bu özel derse ait videoların TAMAMIYLA birebir
  // eşleşiyor mu — başka bir özel dersin videosunu sızdırma veya eksik/hatalı
  // bir listeyle sıralamayı bozma ihtimaline karşı.
  const mevcutVideolar = await db.privateLessonVideo.findMany({ where: { privateLessonId: params.id }, select: { id: true } });
  const mevcutIdSeti = new Set(mevcutVideolar.map((v) => v.id));
  const gelenIdSeti = new Set(siraliIdler);
  const gecerliMi =
    siraliIdler.length === mevcutVideolar.length &&
    siraliIdler.every((id) => mevcutIdSeti.has(id)) &&
    mevcutVideolar.every((v) => gelenIdSeti.has(v.id));
  if (!gecerliMi) {
    return NextResponse.json({ hata: "Video listesi özel dersle eşleşmiyor" }, { status: 400 });
  }

  await db.$transaction(siraliIdler.map((id, i) => db.privateLessonVideo.update({ where: { id }, data: { sira: i + 1 } })));

  await logKaydet({
    seviye: "INFO",
    kategori: "ozel-ders",
    aksiyon: "sirala",
    kaynakEtiketi: `${siraliIdler.length} video`,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
