import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

const semasi = z.object({
  // Kartların sürüklenerek bırakıldıktan sonraki, yukarıdan aşağıya sırasına
  // göre ders ID listesi — bkz. app/admin/courses/[id]/edit/DersYonetimi.tsx.
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

  // Gönderilen liste, gerçekten bu kursa ait derslerin TAMAMIYLA birebir
  // eşleşiyor mu — başka bir kursun dersini sızdırma veya eksik/hatalı bir
  // listeyle sıralamayı bozma ihtimaline karşı.
  const mevcutDersler = await db.lesson.findMany({ where: { courseId: params.id }, select: { id: true } });
  const mevcutIdSeti = new Set(mevcutDersler.map((d) => d.id));
  const gelenIdSeti = new Set(siraliIdler);
  const gecerliMi =
    siraliIdler.length === mevcutDersler.length &&
    siraliIdler.every((id) => mevcutIdSeti.has(id)) &&
    mevcutDersler.every((d) => gelenIdSeti.has(d.id));
  if (!gecerliMi) {
    return NextResponse.json({ hata: "Ders listesi kursla eşleşmiyor" }, { status: 400 });
  }

  await db.$transaction(siraliIdler.map((id, i) => db.lesson.update({ where: { id }, data: { sira: i + 1 } })));

  await logKaydet({
    seviye: "INFO",
    kategori: "ders",
    aksiyon: "sirala",
    kaynakEtiketi: `${siraliIdler.length} ders`,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
