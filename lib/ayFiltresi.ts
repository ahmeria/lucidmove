// Raporlar'ın üç sekmesinde ve admin Panel'de kullanılan ortak "ay" filtresi
// yardımcısı. URL'deki "ay" parametresi üç durumdan birinde olabilir:
//   - yok / geçersiz  → varsayılan: BU AY (mevcutAyAnahtari())
//   - "tumu"          → filtre yok, tüm zamanlar gösterilir
//   - "YYYY-MM"       → o aya ait aralık
// "Tüm zamanlar"ın URL'de AÇIKÇA bir değer ("tumu") olması gerekiyor —
// aksi hâlde parametresiz bir adres hem "varsayılan olarak bu ay" hem
// "filtre hiç uygulanmasın" anlamına gelemezdi (ikisi birden olamaz).
export const TUM_ZAMANLAR = "tumu";

export function mevcutAyAnahtari(): string {
  const simdi = new Date();
  return `${simdi.getFullYear()}-${String(simdi.getMonth() + 1).padStart(2, "0")}`;
}

function gecerliAyMi(ay: string | undefined): ay is string {
  return !!ay && /^\d{4}-\d{2}$/.test(ay);
}

// Prisma `{ gte, lt }` aralığı — filtre yoksa (tüm zamanlar) null döner.
export function ayAraligi(ay: string | undefined): { gte: Date; lt: Date } | null {
  if (ay === TUM_ZAMANLAR) return null;
  const gecerliAy = gecerliAyMi(ay) ? ay : mevcutAyAnahtari();
  const [yil, ayNo] = gecerliAy.split("-").map(Number);
  if (ayNo < 1 || ayNo > 12) return null;
  const baslangic = new Date(yil, ayNo - 1, 1);
  const bitis = new Date(yil, ayNo, 1);
  return { gte: baslangic, lt: bitis };
}

// Filtre bileşeninin göstereceği değer — URL'de "ay" yoksa/geçersizse bu ayı
// gösterir (gerçekte de sorgu bu ayı filtreliyor, bkz. yukarısı), "tumu" ise
// olduğu gibi geçer.
export function gosterilecekAy(ay: string | undefined): string {
  if (ay === TUM_ZAMANLAR) return TUM_ZAMANLAR;
  return gecerliAyMi(ay) ? ay : mevcutAyAnahtari();
}

const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

// Panel'deki istatistik kartlarının altında hangi döneme ait olduğunu
// göstermek için ("Ağustos 2026" / "Tüm zamanlar") — bkz. app/admin/page.tsx.
export function ayEtiketi(ay: string): string {
  if (ay === TUM_ZAMANLAR) return "Tüm zamanlar";
  const [yil, ayNo] = ay.split("-").map(Number);
  return `${AY_ADLARI[ayNo - 1]} ${yil}`;
}
