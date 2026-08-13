import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { gorseldenGuvenliTipCikar } from "@/lib/dosyaImzasi";

const IZIN_VERILEN_TIPLER = ["image/jpeg", "image/png", "image/webp"];
const MAKSIMUM_BOYUT = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ hata: "Giriş yapmalısınız" }, { status: 401 });

  const form = await req.formData();
  const dosya = form.get("dosya");

  if (!(dosya instanceof File)) {
    return NextResponse.json({ hata: "Dosya bulunamadı" }, { status: 400 });
  }

  if (!IZIN_VERILEN_TIPLER.includes(dosya.type)) {
    return NextResponse.json({ hata: "Desteklenmeyen dosya türü — jpg, png veya webp yükleyin" }, { status: 400 });
  }

  if (dosya.size > MAKSIMUM_BOYUT) {
    return NextResponse.json({ hata: "Dosya çok büyük — en fazla 5 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await dosya.arrayBuffer());

  // İstemcinin bildirdiği Content-Type sahteleyebilir bir değerdir — dosyanın
  // gerçek baytlarını (magic number) doğrulayıp uzantıyı ORADAN türetiyoruz,
  // kullanıcının gönderdiği dosya adından değil (bkz. lib/dosyaImzasi.ts).
  const guvenliTip = gorseldenGuvenliTipCikar(buffer, dosya.type);
  if (!guvenliTip) {
    return NextResponse.json({ hata: "Dosya içeriği bildirilen türle uyuşmuyor" }, { status: 400 });
  }

  const dosyaAdi = `${randomUUID()}${guvenliTip.uzanti}`;
  const klasor = path.join(process.cwd(), "public", "uploads", "profil");
  await mkdir(klasor, { recursive: true });
  await writeFile(path.join(klasor, dosyaAdi), buffer);

  const url = `/uploads/profil/${dosyaAdi}`;
  await db.user.update({ where: { id: session.user.id }, data: { profilFotoUrl: url } });

  return NextResponse.json({ basarili: true, url });
}
