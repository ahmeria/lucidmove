import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";
import { sayfaErisimiVarMi, rolKendiErisimindeMi } from "@/lib/adminYetki";

// sifre opsiyonel — boş bırakılırsa mevcut şifre değişmez. Doluysa en az 8
// karakter (kayıt formuyla aynı kural, bkz. app/api/auth/register/route.ts).
const kullaniciSemasi = z.object({
  ad: z.string().min(2),
  email: z.string().email(),
  telefon: z.string().trim().max(32).optional().or(z.literal("")),
  role: z.enum(["UYE", "ADMIN"]),
  sistemYoneticisiMi: z.boolean(),
  adminRoleId: z.string().nullable().optional(),
  sifre: z.string().min(8, "Şifre en az 8 karakter olmalı").optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/users")) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const govde = kullaniciSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }
  const { ad, email, telefon, role, sifre } = govde.data;

  const hedef = await db.user.findUnique({ where: { id: params.id }, select: { sistemYoneticisiMi: true } });
  if (!hedef) return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 });

  // Sistem yöneticisi olmayan bir "Kullanıcılar" yetkilisi, sistem yöneticisi
  // işaretli bir hesaba hiç dokunamaz — bayrağı kaldıramaz, başka bir alanını
  // da değiştiremez (yetki yükseltmesi/kurcalamayı önler).
  if (!session.sistemYoneticisiMi && hedef.sistemYoneticisiMi) {
    return NextResponse.json({ hata: "Bu hesabı yalnızca sistem yöneticisi düzenleyebilir" }, { status: 403 });
  }

  // Üye rolüne düşen bir hesap sistem yöneticisi olamaz — istemci bunu zaten
  // gizliyor ama sunucu tarafında da zorluyoruz. Aynı şekilde sistem yöneticisi
  // zaten tam erişime sahip olduğu için özel bir role atanması anlamsız.
  // sistemYoneticisiMi bayrağını yalnızca ÇAĞIRANIN KENDİSİ sistem yöneticisiyse
  // açabiliyoruz — aksi halde devredilmiş "Kullanıcılar" yetkisiyle kendine/
  // başkasına tam yetki vermenin yolu olurdu.
  const sistemYoneticisiMi = session.sistemYoneticisiMi && role === "ADMIN" ? govde.data.sistemYoneticisiMi : false;
  const adminRoleId = role === "ADMIN" && !sistemYoneticisiMi ? govde.data.adminRoleId || null : null;

  if (role === "ADMIN" && !sistemYoneticisiMi && !session.sistemYoneticisiMi) {
    // Bkz. app/api/admin/users (POST) — aynı gerekçe: rol atanmamış
    // (varsayılan, Ayarlar hariç her şeye erişen) bir admin durumuna
    // getirilemez, yalnızca çağıranın kendi kümesinde olan bir rol atanabilir.
    if (!adminRoleId) {
      return NextResponse.json(
        { hata: "Bir panel rolü seçmelisiniz — sistem yöneticisi olmayan bir yetkili 'varsayılan admin' erişimi veremez" },
        { status: 403 }
      );
    }
    const hedefRol = await db.adminRole.findUnique({ where: { id: adminRoleId }, select: { sayfalar: true } });
    const hedefRolSayfalari = (hedefRol?.sayfalar as string[] | undefined) ?? [];
    if (!hedefRol || !rolKendiErisimindeMi(session.izinliSayfalar ?? [], hedefRolSayfalari)) {
      return NextResponse.json(
        { hata: "Yalnızca kendi erişebildiğiniz sayfaları içeren bir rol atayabilirsiniz" },
        { status: 403 }
      );
    }
  }

  const kendisiMi = params.id === session.user?.id;
  if (kendisiMi && role !== "ADMIN") {
    return NextResponse.json({ hata: "Kendi rolünüzü değiştiremezsiniz" }, { status: 400 });
  }

  if (hedef.sistemYoneticisiMi && !sistemYoneticisiMi) {
    const digerSistemYoneticisiSayisi = await db.user.count({
      where: { sistemYoneticisiMi: true, id: { not: params.id } },
    });
    if (digerSistemYoneticisiSayisi === 0) {
      return NextResponse.json(
        { hata: "Tek sistem yöneticisi bu bayrağı kaybedemez — önce başka bir hesabı sistem yöneticisi yapın" },
        { status: 400 }
      );
    }
  }

  try {
    const kullanici = await db.user.update({
      where: { id: params.id },
      data: {
        ad,
        email: email.toLowerCase(),
        telefon: telefon || null,
        role,
        sistemYoneticisiMi,
        adminRoleId,
        ...(sifre && { passwordHash: await bcrypt.hash(sifre, 12) }),
      },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "kullanici",
      aksiyon: "guncelle",
      kaynakEtiketi: kullanici.email,
      mesaj: sifre ? "Şifre admin tarafından değiştirildi" : undefined,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu e-posta zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Kullanıcı güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/users")) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  if (params.id === session.user?.id) {
    return NextResponse.json({ hata: "Kendi hesabınızı silemezsiniz" }, { status: 400 });
  }

  const hedef = await db.user.findUnique({ where: { id: params.id }, select: { email: true, sistemYoneticisiMi: true } });
  if (!hedef) return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 });

  // Sistem yöneticisi olmayan bir "Kullanıcılar" yetkilisi, sistem yöneticisi
  // işaretli bir hesabı silemez.
  if (!session.sistemYoneticisiMi && hedef.sistemYoneticisiMi) {
    return NextResponse.json({ hata: "Bu hesabı yalnızca sistem yöneticisi silebilir" }, { status: 403 });
  }

  if (hedef.sistemYoneticisiMi) {
    const digerSistemYoneticisiSayisi = await db.user.count({
      where: { sistemYoneticisiMi: true, id: { not: params.id } },
    });
    if (digerSistemYoneticisiSayisi === 0) {
      return NextResponse.json(
        { hata: "Tek sistem yöneticisi silinemez — önce başka bir hesabı sistem yöneticisi yapın" },
        { status: 400 }
      );
    }
  }

  await db.user.delete({ where: { id: params.id } });
  await logKaydet({
    seviye: "INFO",
    kategori: "kullanici",
    aksiyon: "sil",
    kaynakEtiketi: hedef.email,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
