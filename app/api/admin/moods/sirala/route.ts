import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// Kartların sürüklenerek bırakıldıktan sonraki, yukarıdan aşağıya sırasına
// göre mood ID listesi — bkz. app/admin/moods/MoodYonetimi.tsx. Ders
// sıralama uç noktasıyla (bkz. app/api/admin/courses/[id]/lessons/sirala)
// aynı desen, yalnızca bir üst kursa bağlı olmadığı için kapsam kontrolü
// tüm Mood tablosuna göre yapılıyor.
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

  const mevcutMoodlar = await db.mood.findMany({ select: { id: true } });
  const mevcutIdSeti = new Set(mevcutMoodlar.map((m) => m.id));
  const gelenIdSeti = new Set(siraliIdler);
  const gecerliMi =
    siraliIdler.length === mevcutMoodlar.length &&
    siraliIdler.every((id) => mevcutIdSeti.has(id)) &&
    mevcutMoodlar.every((m) => gelenIdSeti.has(m.id));
  if (!gecerliMi) {
    return NextResponse.json({ hata: "Mood listesi eşleşmiyor" }, { status: 400 });
  }

  await db.$transaction(siraliIdler.map((id, i) => db.mood.update({ where: { id }, data: { sira: i + 1 } })));

  await logKaydet({
    seviye: "INFO",
    kategori: "mood",
    aksiyon: "sirala",
    kaynakEtiketi: `${siraliIdler.length} mood`,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
