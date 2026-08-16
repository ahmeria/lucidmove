import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";

// Üretimde NEXTAUTH_URL zaten doğru kanonik domaine (https://lucidmove.net)
// ayarlı olmak zorunda (NextAuth callback'leri için) — metadataBase/hreflang
// için ayrı bir env değişkeni eklemek yerine bunu tekrar kullanıyoruz.
export const SITE_URL = (process.env.NEXTAUTH_URL || "https://lucidmove.net").replace(/\/+$/, "");

// locale + locale'den bağımsız yol (ör. "/" veya "/courses/sabah-uyanisi")
// verildiğinde o locale'in tam URL'ini üretir — "as-needed" prefiks kuralına
// göre yalnızca varsayılan olmayan diller (en, az) önek alır.
export function localeUrl(pathname: string, locale: AppLocale): string {
  const yol = pathname === "/" ? "" : pathname;
  const onek = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${onek}${yol}` || SITE_URL;
}

// Bir sayfanın generateMetadata'sından çağrılır: geçerli locale için
// kendi kendine referans veren bir canonical + üç dilin tümünü (ve
// x-default'u) listeleyen hreflang alternates üretir. Sayfa bunu
// açıkça DÖNDÜRMEZSE üst layout'unkini (yalnızca anasayfa için doğru)
// miras alır — bu yüzden index'lenmesi istenen her sayfa kendi yolunu
// buraya vermeli (bkz. courses/[slug]/page.tsx gibi kullanımlar).
export function localeAlternates(pathname: string, locale: AppLocale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localeUrl(pathname, l);
  languages["x-default"] = localeUrl(pathname, routing.defaultLocale);
  return { canonical: localeUrl(pathname, locale), languages };
}

// next-intl locale kodu -> tam Open Graph locale etiketi (og:locale özel
// biçim bekler: dil_ÜLKE). Azerbaycan dili için ISO ülke kodu AZ.
const OG_LOCALE: Record<AppLocale, string> = { tr: "tr_TR", en: "en_GB", az: "az_AZ" };
export function ogLocale(locale: AppLocale): string {
  return OG_LOCALE[locale];
}

// Özel bir görsel verilmeyen sayfalarda (ör. statik metin sayfaları) Open
// Graph/Twitter paylaşım kartı için kullanılan varsayılan görsel.
export const VARSAYILAN_OG_GORSEL = "/logo.png";
