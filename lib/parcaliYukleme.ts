import { randomUUID } from "crypto";
import { mkdir, open, rename, stat, truncate, unlink, writeFile } from "fs/promises";
import path from "path";
import { videodanGuvenliTipCikar } from "@/lib/dosyaImzasi";

// Büyük video dosyaları (bkz. VideoInput.tsx) tek istekte gönderilmiyor —
// istemci dosyayı sabit boyutlu parçalara bölüp sırayla yolluyor, biz de
// diskte önceden ayrılmış (truncate ile boyutlandırılmış) geçici bir
// dosyaya, her parçayı KENDİ konumuna (index * PARCA_BOYUTU) yazarak
// "dolduruyoruz". Böylece:
//   - Bellek her zaman tek parça kadar (PARCA_BOYUTU) kalır — 2 GB'lık bir
//     dosya asla bütün olarak RAM'e alınmıyor.
//   - Bir parça tekrar gönderilirse (bağlantı hatası sonrası yeniden
//     deneme) aynı konuma yazıldığı için sorun çıkmıyor (idempotent).
// Kayıtlar süreç-ömürlü bir Map'te tutuluyor — projenin diğer yerlerinde de
// kullanılan "tek Node process" varsayımıyla tutarlı (bkz. lib/rateLimit.ts).
export const PARCA_BOYUTU = 8 * 1024 * 1024; // 8 MB
const MAKSIMUM_VIDEO_BOYUTU = 2 * 1024 * 1024 * 1024; // 2 GB
const TERK_EDILME_SURESI_MS = 2 * 60 * 60 * 1000; // 2 saat işlem görmeyen yükleme silinir

const VIDEO_TIPLERI = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

interface YuklemeKaydi {
  toplamBoyut: number;
  toplamParca: number;
  bildirilenTip: string;
  gelenParcalar: Set<number>;
  geciciYol: string;
  sahibiKullaniciId: string;
  guncelleme: number;
}

const kayitlar = new Map<string, YuklemeKaydi>();

function eskiKayitlariTemizle() {
  const simdi = Date.now();
  for (const [id, kayit] of kayitlar) {
    if (simdi - kayit.guncelleme > TERK_EDILME_SURESI_MS) {
      unlink(kayit.geciciYol).catch(() => {});
      kayitlar.delete(id);
    }
  }
}

export async function yuklemeBaslat(params: {
  boyut: number;
  tip: string;
  kullaniciId: string;
}): Promise<{ uploadId: string; parcaBoyutu: number; toplamParca: number } | { hata: string }> {
  eskiKayitlariTemizle();

  if (!VIDEO_TIPLERI.includes(params.tip)) return { hata: "Desteklenmeyen video türü" };
  if (!Number.isFinite(params.boyut) || params.boyut <= 0) return { hata: "Geçersiz dosya boyutu" };
  if (params.boyut > MAKSIMUM_VIDEO_BOYUTU) {
    return { hata: `Dosya çok büyük — en fazla ${Math.round(MAKSIMUM_VIDEO_BOYUTU / 1024 / 1024 / 1024)} GB` };
  }

  const uploadId = randomUUID();
  const geciciKlasor = path.join(process.cwd(), "storage", "tmp-yuklemeler");
  await mkdir(geciciKlasor, { recursive: true });
  const geciciYol = path.join(geciciKlasor, uploadId);

  // Dosyayı baştan hedef boyuta genişletiyoruz — hem parçaları konumsal
  // yazmak için gerekli, hem de disk yetersizse hemen (yükleme başlarken)
  // hata verir, yükleme yarıda kalmaz.
  await writeFile(geciciYol, Buffer.alloc(0));
  await truncate(geciciYol, params.boyut);

  const toplamParca = Math.ceil(params.boyut / PARCA_BOYUTU);
  kayitlar.set(uploadId, {
    toplamBoyut: params.boyut,
    toplamParca,
    bildirilenTip: params.tip,
    gelenParcalar: new Set(),
    geciciYol,
    sahibiKullaniciId: params.kullaniciId,
    guncelleme: Date.now(),
  });

  return { uploadId, parcaBoyutu: PARCA_BOYUTU, toplamParca };
}

export async function parcaYaz(params: {
  uploadId: string;
  index: number;
  veri: Buffer;
  kullaniciId: string;
}): Promise<{ basarili: true } | { hata: string }> {
  const kayit = kayitlar.get(params.uploadId);
  if (!kayit) return { hata: "Yükleme oturumu bulunamadı ya da zaman aşımına uğradı — sayfayı yenileyip tekrar deneyin" };
  if (kayit.sahibiKullaniciId !== params.kullaniciId) return { hata: "Yetkisiz" };
  if (!Number.isInteger(params.index) || params.index < 0 || params.index >= kayit.toplamParca) {
    return { hata: "Geçersiz parça numarası" };
  }
  if (params.veri.length === 0 || params.veri.length > PARCA_BOYUTU) return { hata: "Geçersiz parça boyutu" };

  const handle = await open(kayit.geciciYol, "r+");
  try {
    await handle.write(params.veri, 0, params.veri.length, params.index * PARCA_BOYUTU);
  } finally {
    await handle.close();
  }

  kayit.gelenParcalar.add(params.index);
  kayit.guncelleme = Date.now();
  return { basarili: true };
}

export async function yuklemeyiBitir(params: {
  uploadId: string;
  kullaniciId: string;
}): Promise<{ url: string } | { hata: string }> {
  const kayit = kayitlar.get(params.uploadId);
  if (!kayit) return { hata: "Yükleme oturumu bulunamadı ya da zaman aşımına uğradı — sayfayı yenileyip tekrar deneyin" };
  if (kayit.sahibiKullaniciId !== params.kullaniciId) return { hata: "Yetkisiz" };
  if (kayit.gelenParcalar.size !== kayit.toplamParca) {
    return { hata: `Eksik parça var (${kayit.gelenParcalar.size}/${kayit.toplamParca}) — yükleme tamamlanmadı` };
  }

  const bilgi = await stat(kayit.geciciYol).catch(() => null);
  if (!bilgi || bilgi.size !== kayit.toplamBoyut) {
    kayitlar.delete(params.uploadId);
    unlink(kayit.geciciYol).catch(() => {});
    return { hata: "Dosya boyutu beklenenle uyuşmuyor — yükleme bozuk, tekrar deneyin" };
  }

  // Gerçek dosya tipini doğrulamak için yalnızca ilk baytlar okunuyor —
  // 2 GB'lık dosyayı bütün olarak belleğe almadan (bkz. lib/dosyaImzasi.ts).
  const basBuffer = Buffer.alloc(64);
  const okumaHandle = await open(kayit.geciciYol, "r");
  await okumaHandle.read(basBuffer, 0, 64, 0);
  await okumaHandle.close();

  const guvenliTip = videodanGuvenliTipCikar(basBuffer, kayit.bildirilenTip);
  if (!guvenliTip) {
    kayitlar.delete(params.uploadId);
    unlink(kayit.geciciYol).catch(() => {});
    return { hata: "Dosya içeriği bildirilen türle uyuşmuyor" };
  }

  const hedefKlasor = path.join(process.cwd(), "public", "uploads", "videos");
  await mkdir(hedefKlasor, { recursive: true });
  const dosyaAdi = `${randomUUID()}${guvenliTip.uzanti}`;
  await rename(kayit.geciciYol, path.join(hedefKlasor, dosyaAdi));

  kayitlar.delete(params.uploadId);
  return { url: `/uploads/videos/${dosyaAdi}` };
}

export function yuklemeyiIptalEt(uploadId: string, kullaniciId: string) {
  const kayit = kayitlar.get(uploadId);
  if (!kayit || kayit.sahibiKullaniciId !== kullaniciId) return;
  unlink(kayit.geciciYol).catch(() => {});
  kayitlar.delete(uploadId);
}
