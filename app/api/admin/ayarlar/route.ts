import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// Kısmi güncelleme: bu tek uç, hem genel Ayarlar sayfasının (Site & İletişim,
// SEO) hem de Sayfa Tasarımı sayfasının (Hero, Üyelik bölümü metinleri)
// formlarından çağrılıyor — her biri yalnızca kendi alanlarını gönderiyor.
const semasi = z
  .object({
    siteBasligi: z.string().min(2),
    siteAciklamasi: z.string().min(2),
    heroEyebrow: z.string().min(1),
    heroBaslik: z.string().min(1),
    heroAltBaslik: z.string().min(1),
    heroGorselUrl: z.string().min(1),
    heroCtaBirincil: z.string().min(1),
    heroCtaIkincil: z.string().min(1),
    uyelikEyebrow: z.string().min(1),
    uyelikBaslik: z.string().min(1),
    uyelikAltBaslik: z.string().min(1),
    iletisimEmail: z.string().email(),
    calismaSaatleri: z.string().min(1),
    instagramUrl: z.string().url(),
    footerTagline: z.string().min(1),
  })
  .partial();

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }
  if (Object.keys(govde.data).length === 0) {
    return NextResponse.json({ hata: "Güncellenecek alan yok" }, { status: 400 });
  }

  try {
    const ayarlar = await db.siteSettings.update({ where: { id: "ana" }, data: govde.data });
    return NextResponse.json({ basarili: true, ayarlar });
  } catch {
    return NextResponse.json({ hata: "Ayarlar güncellenemedi" }, { status: 500 });
  }
}
