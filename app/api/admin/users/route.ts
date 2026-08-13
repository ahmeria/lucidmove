import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// Panelden elle kullanıcı oluşturma — normalde /register üzerinden üye olunup
// admin panelden rol yükseltilir; bu, sistem yöneticisinin doğrudan bir
// admin/üye hesabı açmasını sağlayan kısayol. Şifre burada zorunlu (edit
// formundan farklı olarak) — yeni hesabın bir giriş şifresi olması gerekir.
const kullaniciSemasi = z.object({
  ad: z.string().min(2),
  email: z.string().email(),
  telefon: z.string().trim().max(32).optional().or(z.literal("")),
  role: z.enum(["UYE", "ADMIN"]),
  sistemYoneticisiMi: z.boolean(),
  adminRoleId: z.string().nullable().optional(),
  sifre: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = kullaniciSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: govde.error.issues[0]?.message || "Geçersiz form verisi" }, { status: 400 });
  }

  const { ad, email, telefon, role, sifre } = govde.data;
  const sistemYoneticisiMi = role === "ADMIN" ? govde.data.sistemYoneticisiMi : false;
  const adminRoleId = role === "ADMIN" && !sistemYoneticisiMi ? govde.data.adminRoleId || null : null;

  try {
    const passwordHash = await bcrypt.hash(sifre, 12);
    const kullanici = await db.user.create({
      data: {
        ad,
        email: email.toLowerCase(),
        telefon: telefon || null,
        role,
        sistemYoneticisiMi,
        adminRoleId,
        passwordHash,
      },
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
    return NextResponse.json({ hata: "Kullanıcı oluşturulamadı" }, { status: 500 });
  }
}
