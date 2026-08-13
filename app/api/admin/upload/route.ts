import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/admin-auth";
import { gorseldenGuvenliTipCikar } from "@/lib/dosyaImzasi";

const RESIM_TIPLERI = ["image/jpeg", "image/png", "image/webp"];
const MAKSIMUM_RESIM_BOYUTU = 10 * 1024 * 1024; // 10 MB

// Admin panelindeki görsel yüklemeleri (kurs kapağı, videodan seçilen kare
// vb.) bu uçtan geçer — gerçek baytlar (magic number) doğrulanır, dosya
// uploads/images altına yazılır. Video yüklemeleri artık burada DEĞİL,
// parçalı (chunked) sistemden geçiyor — bkz. lib/parcaliYukleme.ts ve
// app/api/admin/upload/video/**. Videolar büyük (2 GB'a kadar) olabildiği
// için tek istekte bütün dosyayı belleğe almak riskliydi.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const form = await req.formData();
  const dosya = form.get("dosya");

  if (!(dosya instanceof File)) {
    return NextResponse.json({ hata: "Dosya bulunamadı" }, { status: 400 });
  }

  if (!RESIM_TIPLERI.includes(dosya.type)) {
    return NextResponse.json({ hata: "Desteklenmeyen dosya türü — jpg, png veya webp yükleyin" }, { status: 400 });
  }

  if (dosya.size > MAKSIMUM_RESIM_BOYUTU) {
    return NextResponse.json({ hata: "Dosya çok büyük — en fazla 10 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await dosya.arrayBuffer());

  // İstemcinin bildirdiği Content-Type sahteleyebilir bir değerdir — dosyanın
  // gerçek baytlarını (magic number) doğrulayıp uzantıyı ORADAN türetiyoruz,
  // kullanıcının gönderdiği dosya adından değil (bkz. lib/dosyaImzasi.ts). Aksi
  // halde ".html" gibi bir dosya sahte bir Content-Type ile yüklenip sitenin
  // kendi alan adından servis edilen bir stored-XSS/oltalama dosyasına dönüşebilir.
  const guvenliTip = gorseldenGuvenliTipCikar(buffer, dosya.type);
  if (!guvenliTip) {
    return NextResponse.json({ hata: "Dosya içeriği bildirilen türle uyuşmuyor" }, { status: 400 });
  }

  const dosyaAdi = `${randomUUID()}${guvenliTip.uzanti}`;
  const klasor = path.join(process.cwd(), "public", "uploads", "images");
  await mkdir(klasor, { recursive: true });
  await writeFile(path.join(klasor, dosyaAdi), buffer);

  return NextResponse.json({ basarili: true, url: `/uploads/images/${dosyaAdi}` });
}
