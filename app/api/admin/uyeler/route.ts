import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// /admin/uyeler'deki "Yeni üye ekle" butonunun uç noktası — her zaman UYE
// rolünde, düz bir üye hesabı açar (admin/rol seçimi yok, bunun için bkz.
// /admin/ayarlar/kullanicilar/yeni). sistemYoneticisiMi gerektirmiyor —
// sayfanın kendisi de gerektirmiyor, aynı erişim seviyesinde kalıyor.
const semaFn = z.object({
  ad: z.string().min(2),
  email: z.string().email(),
  telefon: z.string().trim().max(32).optional().or(z.literal("")),
  sifre: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semaFn.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: govde.error.issues[0]?.message || "Geçersiz form verisi" }, { status: 400 });
  }
  const { ad, email, telefon, sifre } = govde.data;

  try {
    const passwordHash = await bcrypt.hash(sifre, 12);
    const kullanici = await db.user.create({
      data: { ad, email: email.toLowerCase(), telefon: telefon || null, role: "UYE", passwordHash },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "kullanici",
      aksiyon: "olustur",
      kaynakEtiketi: kullanici.email,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, kullanici });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu e-posta zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Üye oluşturulamadı" }, { status: 500 });
  }
}
