import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// Kartların sürüklenerek bırakıldıktan sonraki, yukarıdan aşağıya sırasına
// göre kurs ID listesi — bkz. app/admin/courses/KursListesi.tsx. Ders/mood
// sıralama uç noktalarıyla (bkz. lessons/sirala, moods/sirala) aynı desen.
const semasi = z.object({
  siraliIdler: z.array(z.string()).min(1),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }
  const { siraliIdler } = govde.data;

  const mevcutKurslar = await db.course.findMany({ select: { id: true } });
  const mevcutIdSeti = new Set(mevcutKurslar.map((k) => k.id));
  const gelenIdSeti = new Set(siraliIdler);
  const gecerliMi =
    siraliIdler.length === mevcutKurslar.length &&
    siraliIdler.every((id) => mevcutIdSeti.has(id)) &&
    mevcutKurslar.every((k) => gelenIdSeti.has(k.id));
  if (!gecerliMi) {
    return NextResponse.json({ hata: "Kurs listesi eşleşmiyor" }, { status: 400 });
  }

  await db.$transaction(siraliIdler.map((id, i) => db.course.update({ where: { id }, data: { sira: i + 1 } })));

  await logKaydet({
    seviye: "INFO",
    kategori: "kurs",
    aksiyon: "sirala",
    kaynakEtiketi: `${siraliIdler.length} kurs`,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
