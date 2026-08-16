import type { AppLocale } from "@/i18n/routing";

// DB'deki çevrilebilir alanlar "alan" (Türkçe, zorunlu) + "alanEn" + "alanAz"
// (ikisi de opsiyonel) üçlüsü şeklinde saklanıyor (bkz. prisma/schema.prisma).
// Bu yardımcı, verilen locale'e uygun metni döndürür — EN/AZ sütunu boşsa
// (henüz çevrilmemişse) sessizce Türkçe'ye düşer, sayfa hiçbir zaman boş
// içerikle kalmaz.
export function cevrilenAlan(
  turkce: string,
  ingilizce: string | null | undefined,
  azerbaycanca: string | null | undefined,
  locale: AppLocale
): string {
  if (locale === "en" && ingilizce) return ingilizce;
  if (locale === "az" && azerbaycanca) return azerbaycanca;
  return turkce;
}

// aciklama/bio gibi opsiyonel (null olabilen) Türkçe tabanlı alanlar için.
export function cevrilenAlanOpsiyonel(
  turkce: string | null | undefined,
  ingilizce: string | null | undefined,
  azerbaycanca: string | null | undefined,
  locale: AppLocale
): string | null {
  if (locale === "en" && ingilizce) return ingilizce;
  if (locale === "az" && azerbaycanca) return azerbaycanca;
  return turkce ?? null;
}
