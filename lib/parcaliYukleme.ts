import { randomUUID } from "crypto";
import { mkdir, open, readdir, readFile, rename, stat, truncate, unlink, writeFile } from "fs/promises";
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
// Kayıtlar bir Map'te önbelleklenir AMA gerçek kaynak diskteki ".json"
// yanındaş (sidecar) dosyasıdır — yalnızca belleğe güvenilseydi, sunucu
// süreci yükleme ortasında yeniden başladığında (dev sunucusu yeniden
// başlatma, pm2 çökme/yeniden başlatma, güncelleme sonrası restart) tüm
// devam eden yüklemeler "Yükleme oturumu bulunamadı" hatasıyla kaybolurdu —
// bu canlıda gerçekten yaşandı. Şimdi her parça yazıldığında ilerleme diske
// de yazılıyor, süreç yeniden başlasa bile bir sonraki istek diskten
// kaldığı yerden devam edebiliyor.
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

// Diske yazılan sidecar dosyasının JSON şekli — YuklemeKaydi ile aynı, yalnızca
// gelenParcalar bir Set değil (JSON'da Set yok) sıralı bir dizi.
interface Metaveri {
  toplamBoyut: number;
  toplamParca: number;
  bildirilenTip: string;
  gelenParcalar: number[];
  sahibiKullaniciId: string;
  guncelleme: number;
}

const kayitlar = new Map<string, YuklemeKaydi>();

function geciciKlasorYolu() {
  return path.join(process.cwd(), "storage", "tmp-uploads");
}

function metaYolu(geciciYol: string) {
  return `${geciciYol}.json`;
}

async function metaVeriYaz(kayit: YuklemeKaydi) {
  const metaveri: Metaveri = {
    toplamBoyut: kayit.toplamBoyut,
    toplamParca: kayit.toplamParca,
    bildirilenTip: kayit.bildirilenTip,
    gelenParcalar: [...kayit.gelenParcalar],
    sahibiKullaniciId: kayit.sahibiKullaniciId,
    guncelleme: kayit.guncelleme,
  };
  // Bu bir ilerleme kaydı — yazımı başarısız olsa bile (ör. anlık disk
  // meşguliyeti) asıl parça yazma işlemini engellememeli, bir sonraki
  // parçada tekrar denenir.
  await writeFile(metaYolu(kayit.geciciYol), JSON.stringify(metaveri)).catch(() => {});
}

// Bellekte yoksa diskteki sidecar'dan (varsa) yeniden kurar — süreç yeniden
// başlamış olsa bile yükleme kaldığı yerden devam edebilsin diye.
async function kaydiGetir(uploadId: string): Promise<YuklemeKaydi | undefined> {
  const bellekteki = kayitlar.get(uploadId);
  if (bellekteki) return bellekteki;

  const geciciYol = path.join(geciciKlasorYolu(), uploadId);
  const [metaIcerik] = await Promise.all([readFile(metaYolu(geciciYol), "utf-8").catch(() => null)]);
  if (!metaIcerik) return undefined;

  try {
    const metaveri = JSON.parse(metaIcerik) as Metaveri;
    const kayit: YuklemeKaydi = {
      toplamBoyut: metaveri.toplamBoyut,
      toplamParca: metaveri.toplamParca,
      bildirilenTip: metaveri.bildirilenTip,
      gelenParcalar: new Set(metaveri.gelenParcalar),
      geciciYol,
      sahibiKullaniciId: metaveri.sahibiKullaniciId,
      guncelleme: metaveri.guncelleme,
    };
    kayitlar.set(uploadId, kayit);
    return kayit;
  } catch {
    return undefined;
  }
}

async function kaydiSilVeTemizle(uploadId: string, geciciYol: string) {
  kayitlar.delete(uploadId);
  await Promise.all([unlink(geciciYol).catch(() => {}), unlink(metaYolu(geciciYol)).catch(() => {})]);
}

// Bellekteki kayıtların yanı sıra, diskte kalmış (ör. süreç bu terk edilme
// süresi içinde hiç yeniden başlamadıysa belleğe hiç girmemiş) eski sidecar
// dosyalarını da tarar — yalnızca Map'e güvenmek, süreç yeniden başladıktan
// sonra artık kimsenin bilmediği terk edilmiş dosyaların hiç silinmemesine
// yol açardı.
async function eskiKayitlariTemizle() {
  const simdi = Date.now();
  for (const [id, kayit] of kayitlar) {
    if (simdi - kayit.guncelleme > TERK_EDILME_SURESI_MS) {
      await kaydiSilVeTemizle(id, kayit.geciciYol);
    }
  }

  const klasor = geciciKlasorYolu();
  const dosyalar = await readdir(klasor).catch(() => [] as string[]);
  const jsonOlanlar = new Set(dosyalar.filter((d) => d.endsWith(".json")));
  for (const dosyaAdi of dosyalar) {
    // Sidecar'ı OLMAYAN bir ikili dosya da temizlenmeli — bu fonksiyon
    // eklenmeden ÖNCE (ya da sidecar yazımı bir şekilde başarısız olduysa)
    // oluşmuş, hiçbir zaman kimsenin bilmediği yetim dosyalar bunlar.
    const uploadId = dosyaAdi.endsWith(".json") ? dosyaAdi.slice(0, -".json".length) : dosyaAdi;
    if (!dosyaAdi.endsWith(".json") && jsonOlanlar.has(`${dosyaAdi}.json`)) continue; // aşağıda .json üzerinden ele alınacak
    if (kayitlar.has(uploadId)) continue; // az önce yukarıda ele alındı

    const geciciYol = path.join(klasor, uploadId);
    const bilgi = await stat(geciciYol).catch(() => null);
    if (!bilgi || simdi - bilgi.mtimeMs > TERK_EDILME_SURESI_MS) {
      await kaydiSilVeTemizle(uploadId, geciciYol);
    }
  }
}

export async function yuklemeBaslat(params: {
  boyut: number;
  tip: string;
  kullaniciId: string;
}): Promise<{ uploadId: string; parcaBoyutu: number; toplamParca: number } | { hata: string }> {
  await eskiKayitlariTemizle();

  if (!VIDEO_TIPLERI.includes(params.tip)) return { hata: "Desteklenmeyen video türü" };
  if (!Number.isFinite(params.boyut) || params.boyut <= 0) return { hata: "Geçersiz dosya boyutu" };
  if (params.boyut > MAKSIMUM_VIDEO_BOYUTU) {
    return { hata: `Dosya çok büyük — en fazla ${Math.round(MAKSIMUM_VIDEO_BOYUTU / 1024 / 1024 / 1024)} GB` };
  }

  const uploadId = randomUUID();
  const geciciKlasor = geciciKlasorYolu();
  await mkdir(geciciKlasor, { recursive: true });
  const geciciYol = path.join(geciciKlasor, uploadId);

  // Dosyayı baştan hedef boyuta genişletiyoruz — hem parçaları konumsal
  // yazmak için gerekli, hem de disk yetersizse hemen (yükleme başlarken)
  // hata verir, yükleme yarıda kalmaz.
  await writeFile(geciciYol, Buffer.alloc(0));
  await truncate(geciciYol, params.boyut);

  const toplamParca = Math.ceil(params.boyut / PARCA_BOYUTU);
  const kayit: YuklemeKaydi = {
    toplamBoyut: params.boyut,
    toplamParca,
    bildirilenTip: params.tip,
    gelenParcalar: new Set(),
    geciciYol,
    sahibiKullaniciId: params.kullaniciId,
    guncelleme: Date.now(),
  };
  kayitlar.set(uploadId, kayit);
  await metaVeriYaz(kayit);

  return { uploadId, parcaBoyutu: PARCA_BOYUTU, toplamParca };
}

export async function parcaYaz(params: {
  uploadId: string;
  index: number;
  veri: Buffer;
  kullaniciId: string;
}): Promise<{ basarili: true } | { hata: string }> {
  const kayit = await kaydiGetir(params.uploadId);
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
  await metaVeriYaz(kayit);
  return { basarili: true };
}

export async function yuklemeyiBitir(params: {
  uploadId: string;
  kullaniciId: string;
}): Promise<{ url: string } | { hata: string }> {
  const kayit = await kaydiGetir(params.uploadId);
  if (!kayit) return { hata: "Yükleme oturumu bulunamadı ya da zaman aşımına uğradı — sayfayı yenileyip tekrar deneyin" };
  if (kayit.sahibiKullaniciId !== params.kullaniciId) return { hata: "Yetkisiz" };
  if (kayit.gelenParcalar.size !== kayit.toplamParca) {
    return { hata: `Eksik parça var (${kayit.gelenParcalar.size}/${kayit.toplamParca}) — yükleme tamamlanmadı` };
  }

  const bilgi = await stat(kayit.geciciYol).catch(() => null);
  if (!bilgi || bilgi.size !== kayit.toplamBoyut) {
    await kaydiSilVeTemizle(params.uploadId, kayit.geciciYol);
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
    await kaydiSilVeTemizle(params.uploadId, kayit.geciciYol);
    return { hata: "Dosya içeriği bildirilen türle uyuşmuyor" };
  }

  const hedefKlasor = path.join(process.cwd(), "public", "uploads", "videos");
  await mkdir(hedefKlasor, { recursive: true });
  const dosyaAdi = `${randomUUID()}${guvenliTip.uzanti}`;
  await rename(kayit.geciciYol, path.join(hedefKlasor, dosyaAdi));

  kayitlar.delete(params.uploadId);
  await unlink(metaYolu(kayit.geciciYol)).catch(() => {});
  return { url: `/uploads/videos/${dosyaAdi}` };
}

export async function yuklemeyiIptalEt(uploadId: string, kullaniciId: string) {
  const kayit = await kaydiGetir(uploadId);
  if (!kayit || kayit.sahibiKullaniciId !== kullaniciId) return;
  await kaydiSilVeTemizle(uploadId, kayit.geciciYol);
}
