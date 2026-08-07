import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/admin-auth";
import { gorseldenGuvenliTipCikar, videodanGuvenliTipCikar } from "@/lib/dosyaImzasi";

const RESIM_TIPLERI = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TIPLERI = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

const MAKSIMUM_RESIM_BOYUTU = 10 * 1024 * 1024; // 10 MB
const MAKSIMUM_VIDEO_BOYUTU = 500 * 1024 * 1024; // 500 MB

// Admin panelindeki tüm görsel (kurs kapağı vb.) ve video (ders/tanıtım) yüklemeleri
// bu tek uçtan geçer — bildirilen türe göre resim/video dalına ayrılır, gerçek
// baytlar (magic number) doğrulanır, dosya buna göre uploads/images ya da
// uploads/videos altına yazılır.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const form = await req.formData();
  const dosya = form.get("dosya");

  if (!(dosya instanceof File)) {
    return NextResponse.json({ hata: "Dosya bulunamadı" }, { status: 400 });
  }

  const resimMi = RESIM_TIPLERI.includes(dosya.type);
  const videoMu = VIDEO_TIPLERI.includes(dosya.type);

  if (!resimMi && !videoMu) {
    return NextResponse.json(
      { hata: "Desteklenmeyen dosya türü — jpg, png, webp, mp4, webm, ogg veya mov yükleyin" },
      { status: 400 }
    );
  }

  const maksimumBoyut = resimMi ? MAKSIMUM_RESIM_BOYUTU : MAKSIMUM_VIDEO_BOYUTU;
  if (dosya.size > maksimumBoyut) {
    return NextResponse.json(
      { hata: `Dosya çok büyük — en fazla ${resimMi ? "10 MB" : "500 MB"}` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await dosya.arrayBuffer());

  // İstemcinin bildirdiği Content-Type sahteleyebilir bir değerdir — dosyanın
  // gerçek baytlarını (magic number) doğrulayıp uzantıyı ORADAN türetiyoruz,
  // kullanıcının gönderdiği dosya adından değil (bkz. lib/dosyaImzasi.ts). Aksi
  // halde ".html" gibi bir dosya sahte bir Content-Type ile yüklenip sitenin
  // kendi alan adından servis edilen bir stored-XSS/oltalama dosyasına dönüşebilir.
  const guvenliTip = resimMi
    ? gorseldenGuvenliTipCikar(buffer, dosya.type)
    : videodanGuvenliTipCikar(buffer, dosya.type);
  if (!guvenliTip) {
    return NextResponse.json({ hata: "Dosya içeriği bildirilen türle uyuşmuyor" }, { status: 400 });
  }

  const dosyaAdi = `${randomUUID()}${guvenliTip.uzanti}`;
  const altKlasor = resimMi ? "images" : "videos";
  const klasor = path.join(process.cwd(), "public", "uploads", altKlasor);
  await mkdir(klasor, { recursive: true });
  await writeFile(path.join(klasor, dosyaAdi), buffer);

  return NextResponse.json({ basarili: true, url: `/uploads/${altKlasor}/${dosyaAdi}` });
}
