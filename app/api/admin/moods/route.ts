import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

const moodSemasi = z.object({
  ad: z.string().min(2).max(100),
  adEn: z.string().optional(),
  adAz: z.string().optional(),
  gorselUrl: gorselUrlSemasiOpsiyonel,
  sira: z.number().int(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = moodSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }
  const { ad, adEn, adAz, gorselUrl, sira } = govde.data;
  // Slug yalnızca oluştururken addan türetilir ve sonrasında sabit kalır —
  // bkz. prisma/schema.prisma > Mood notu.
  const slug = slugifyTr(ad);

  try {
    const mood = await db.mood.create({
      data: { ad, adEn: adEn || null, adAz: adAz || null, slug, gorselUrl: gorselUrl || null, sira },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "mood",
      aksiyon: "olustur",
      kaynakEtiketi: mood.ad,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, mood });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu isimde (veya aynı kısa koda türeyen) bir mood zaten var" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Mood oluşturulamadı" }, { status: 500 });
  }
}
