import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/admin-auth";
import { videodanGuvenliTipCikar } from "@/lib/dosyaImzasi";

const IZIN_VERILEN_TIPLER = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const MAKSIMUM_BOYUT = 500 * 1024 * 1024; // 500 MB

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const form = await req.formData();
  const dosya = form.get("dosya");

  if (!(dosya instanceof File)) {
    return NextResponse.json({ hata: "Dosya bulunamadı" }, { status: 400 });
  }

  if (!IZIN_VERILEN_TIPLER.includes(dosya.type)) {
    return NextResponse.json({ hata: "Desteklenmeyen dosya türü — mp4, webm, ogg veya mov yükleyin" }, { status: 400 });
  }

  if (dosya.size > MAKSIMUM_BOYUT) {
    return NextResponse.json({ hata: "Dosya çok büyük — en fazla 500 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await dosya.arrayBuffer());

  // İstemcinin bildirdiği Content-Type sahteleyebilir bir değerdir — dosyanın
  // gerçek baytlarını (magic number) doğrulayıp uzantıyı ORADAN türetiyoruz,
  // kullanıcının gönderdiği dosya adından değil (bkz. lib/dosyaImzasi.ts). Bu uç
  // yalnızca admin'e açık olsa da, aynı disiplin (sadeceYukleme videolar public/
  // altında servis edildiği için) burada da uygulanıyor.
  const guvenliTip = videodanGuvenliTipCikar(buffer, dosya.type);
  if (!guvenliTip) {
    return NextResponse.json({ hata: "Dosya içeriği bildirilen türle uyuşmuyor" }, { status: 400 });
  }

  const dosyaAdi = `${randomUUID()}${guvenliTip.uzanti}`;
  const klasor = path.join(process.cwd(), "public", "uploads", "videos");
  await mkdir(klasor, { recursive: true });
  await writeFile(path.join(klasor, dosyaAdi), buffer);

  return NextResponse.json({ basarili: true, url: `/uploads/videos/${dosyaAdi}` });
}
