import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Camp, CampReservation } from "@prisma/client";

// Kamp kontenjanı/rezervasyon süre-dolma (expiry) mantığının TEK kaynağı.
// Projede zamanlanmış görev (cron) altyapısı yok — bu yüzden "rezervasyon
// süresi doldu mu" hiçbir zaman arka planda değil, HER okuma anında (bu
// dosyadaki fonksiyonlar üzerinden) tembel (lazy) olarak hesaplanır/kendi
// kendini düzeltir. Bir kampı/rezervasyonu okuyan/listeleyen her yer (anasayfa,
// kamp detay sayfası, admin liste/rezervasyon sayfaları, dashboard, rezervasyon
// API'leri) önce bu dosyadaki bir fonksiyonu çağırmalı — "hangi durum kontenjanı
// doldurur" kuralı burada tek yerde tutuluyor.

// Kontenjanı DOLDURAN durumlar: henüz süresi dolmamış REZERVE_EDILDI ve ODENDI.
const DOLU_SAYILAN_DURUMLAR = ["REZERVE_EDILDI", "ODENDI"] as const;

// Navbar/Footer'daki "Kamplar" linkinin gösterilip gösterilmeyeceğine karar
// vermek için — bkz. app/[locale]/(site)/layout.tsx. Yalnızca varlık sorusu
// (yayindaMi/tarih), rezervasyon süre-dolma yan etkisi GEREKMİYOR (o,
// CampReservation'ı ilgilendirir, Camp'in kendisini değil).
//
// unstable_cache ile 60 saniye önbelleklendi: bu, layout aracılığıyla SİTE
// GENELİNDEKİ HER SAYFADA (dynamic="force-dynamic" olan sayfalar dahil, ör.
// kurs/kamp/özel-ders detay sayfaları) her istekte çalışıyor — önbelleksiz
// haliyle build sırasındaki 96 sayfalık paralel statik üretimde paylaşılan
// MySQL'in bağlantı limitini gerçekten aşırdı ("Too many connections",
// doğrulanmış). Yeni bir kamp yayınlandığında linkin görünmesi en fazla 60
// saniye gecikebilir — bu ölçekte bir nav linki için kabul edilebilir bir
// bedel, sitenin her sayfa yüklemesinde ekstra bir DB sorgusuna değmez.
export const yayindaKampVarMi = unstable_cache(
  async (): Promise<boolean> => {
    const sayi = await db.camp.count({ where: { yayindaMi: true, bitisTarihi: { gte: new Date() } } });
    return sayi > 0;
  },
  ["yayinda-kamp-var-mi"],
  { revalidate: 60 }
);

// Süresi geçmiş ama hâlâ REZERVE_EDILDI görünen kayıtları SURESI_DOLDU'ya
// çevirir — bu, o kaydın tuttuğu yeri serbest bırakır. `campId` verilirse
// yalnızca o kampa daraltılır (tek kamp sayfası/API'si için ucuz); verilmezse
// tüm kamplar taranır (anasayfa/dashboard gibi toplu okumalar için).
export async function suresiGecenRezervasyonlariGuncelle(campId?: string): Promise<void> {
  await db.campReservation.updateMany({
    where: {
      status: "REZERVE_EDILDI",
      sonOdemeTarihi: { lt: new Date() },
      ...(campId ? { campId } : {}),
    },
    data: { status: "SURESI_DOLDU" },
  });
}

// Bir kampın kalan kontenjanını hesaplar — önce o kampın süresi geçmiş
// kayıtlarını günceller, sonra doluluk sayar. Asla negatif dönmez.
export async function kalanKontenjaniHesapla(camp: { id: string; kapasite: number }): Promise<number> {
  await suresiGecenRezervasyonlariGuncelle(camp.id);
  const dolu = await db.campReservation.count({
    where: { campId: camp.id, status: { in: [...DOLU_SAYILAN_DURUMLAR] } },
  });
  return Math.max(0, camp.kapasite - dolu);
}

// Bir üyenin bir kamp için en son rezervasyon kaydını (HANGİ durumda olursa
// olsun) döner — kamp detay sayfası tamamen bu kaydın `.status`'üne göre
// dallanır (REZERVE_EDILDI: ödeme bekleniyor, ODENDI: onaylı, SURESI_DOLDU/
// IPTAL_EDILDI: tekrar rezervasyon/satın alma teklif edilir).
export async function sonRezervasyonuGetir(campId: string, userId: string): Promise<CampReservation | null> {
  await suresiGecenRezervasyonlariGuncelle(campId);
  return db.campReservation.findFirst({
    where: { campId, userId },
    orderBy: { createdAt: "desc" },
  });
}

export interface YaklasanKamp extends Camp {
  kalanKontenjan: number;
}

// Anasayfada gösterilecek, yayında ve henüz bitmemiş kampları (kronolojik
// sırayla) kalan kontenjanlarıyla birlikte döner. Boş dizi = anasayfa mevcut
// "Pratiğin içinden" galerisini göstermeye devam eder (bkz. page.tsx).
export async function yayindaVeYaklasanKamplariGetir(): Promise<YaklasanKamp[]> {
  await suresiGecenRezervasyonlariGuncelle();

  const kamplar = await db.camp.findMany({
    where: { yayindaMi: true, bitisTarihi: { gte: new Date() } },
    orderBy: { baslangicTarihi: "asc" },
  });
  if (kamplar.length === 0) return [];

  // Tek tek count() yerine tek bir groupBy — preview feature gerektiren
  // filtrelenmiş nested _count'a ihtiyaç duymadan aynı sonucu verir.
  const gruplar = await db.campReservation.groupBy({
    by: ["campId"],
    where: { campId: { in: kamplar.map((k) => k.id) }, status: { in: [...DOLU_SAYILAN_DURUMLAR] } },
    _count: { _all: true },
  });
  const doluluk = new Map(gruplar.map((g) => [g.campId, g._count._all]));

  return kamplar.map((k) => ({ ...k, kalanKontenjan: Math.max(0, k.kapasite - (doluluk.get(k.id) ?? 0)) }));
}
