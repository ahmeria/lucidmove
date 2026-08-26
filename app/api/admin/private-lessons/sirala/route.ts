import { NextResponse } from "next/server";
import { z } from "zod";
import { sayfaYetkisiOlanOturum } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// bkz. app/api/admin/courses/sirala/route.ts — birebir aynı desen.
const semasi = z.object({
  siraliIdler: z.array(z.string()).min(1),
});

export async function PATCH(req: Request) {
  const session = await sayfaYetkisiOlanOturum("/admin/private-lessons");
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }
  const { siraliIdler } = govde.data;

  const mevcutDersler = await db.privateLesson.findMany({ select: { id: true } });
  const mevcutIdSeti = new Set(mevcutDersler.map((d) => d.id));
  const gelenIdSeti = new Set(siraliIdler);
  const gecerliMi =
    siraliIdler.length === mevcutDersler.length &&
    siraliIdler.every((id) => mevcutIdSeti.has(id)) &&
    mevcutDersler.every((d) => gelenIdSeti.has(d.id));
  if (!gecerliMi) {
    return NextResponse.json({ hata: "Özel ders listesi eşleşmiyor" }, { status: 400 });
  }

  await db.$transaction(siraliIdler.map((id, i) => db.privateLesson.update({ where: { id }, data: { sira: i + 1 } })));

  await logKaydet({
    seviye: "INFO",
    kategori: "ozel-ders",
    aksiyon: "sirala",
    kaynakEtiketi: `${siraliIdler.length} özel ders`,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
