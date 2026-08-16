import { cache } from "react";
import { db } from "@/lib/db";
import type { AppLocale } from "@/i18n/routing";

const SITE_SETTINGS_ID = "ana";
const INSTRUCTOR_PROFILE_ID = "ana";

const varsayilanSiteAyarlari = {
  id: SITE_SETTINGS_ID,
  siteBasligi: "LucidMove — Evinizde, kendi hızınızda yoga",
  siteAciklamasi:
    "Aylık veya yıllık üyelikle sınırsız yoga videosuna erişin. Başlangıçtan ileri seviyeye, tek eğitmenle bütünlüklü bir pratik.",
  heroEyebrow: "Tek eğitmen · sınırsız pratik",
  heroBaslik: "Nefesinizin *hızında* bir yoga pratiği.",
  heroAltBaslik:
    "Stüdyoya gitmeden, kendi salonunuzda; başlangıçtan ileri seviyeye haftalık yeni derslerle büyüyen bir video kütüphanesi.",
  heroGorselUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1800&auto=format&fit=crop",
  heroVideoUrl: "/hero/desktop.mp4",
  heroCtaBirincil: "Üyeliği başlat",
  heroCtaIkincil: "Kursları incele",
  uyelikEyebrow: "Üyelik",
  uyelikBaslik: "Bir plan seçin, istediğiniz an bırakın.",
  uyelikAltBaslik: "Tüm planlar kütüphanenin tamamına erişim içerir. Gizli ücret yok.",
  iletisimEmail: "merhaba@lucidmove.net",
  calismaSaatleri: "Pazartesi–Cuma, 09:00–18:00",
  instagramUrl: "https://www.instagram.com/idilyogamove/",
  footerTagline: "Evinizin sessizliğinde, kendi hızınızda bir yoga pratiği.",
};

const varsayilanEgitmenProfili = {
  id: INSTRUCTOR_PROFILE_ID,
  ad: "İdil Ece Bal",
  bio: [
    "On yılı aşkın süredir yoga öğretiyorum. Yolculuğum, uzun süren bir masa başı dönemim sonrasında bedenimle yeniden tanışma ihtiyacından başladı — bugün aynı ihtiyacı sizinle paylaşan binlerce kişiye rehberlik ediyorum.",
    "200 saatlik Hatha Yoga öğretmenlik sertifikamın ardından Vinyasa ve Yin Yoga alanlarında uzmanlaştım. Derslerimde hız değil, doğru hizalanma ve nefesle uyum önceliğim.",
    "LucidMove, stüdyoda yıllardır anlattığım o sakin, sabırlı sesi evinize taşımak için var oldu. Her video tek çekim; kusurlu anlar dahil, çünkü gerçek bir pratik zaten böyle.",
  ].join("\n\n"),
  sertifikalar: ["200 saat Hatha Yoga Öğretmenliği", "Yin Yoga Uzmanlık Eğitimi", "Vinyasa Akış Sertifikası"].join(
    "\n"
  ),
  yaklasim: ["Nefes önce, hareket sonra", "Her seviyeye uyarlanabilir duruşlar", "Sabit, sakin, tekrar edilebilir ritim"].join(
    "\n"
  ),
  portreUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=900&auto=format&fit=crop",
  hakkimdaTeaserOzet: "10 yıldır aynı soruyu soruyorum: bugün bedenine nasıl bakacaksın?",
};

// React'ın request-scoped cache()'i ile sarmalı — aynı istek içinde (ör.
// generateMetadata + layout + page gibi) birden çok yerden çağrılırsa
// veritabanına tekrar tekrar gitmek yerine ilk sonucu paylaşır.
export const getSiteSettings = cache(async function getSiteSettings() {
  return db.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {},
    create: varsayilanSiteAyarlari,
  });
});

export async function getInstructorProfile() {
  return db.instructorProfile.upsert({
    where: { id: INSTRUCTOR_PROFILE_ID },
    update: {},
    create: varsayilanEgitmenProfili,
  });
}

// Anasayfa "Stüdyodan kareler" galerisi — önceden sabit kodlanmış görsellerdi,
// şimdi admin panelden yönetilebilir bir liste (bkz.
// app/admin/settings/page-design). Boşsa bölüm sayfada hiç görünmez —
// bilerek burada "otomatik doldur" mantığı YOK: bu, istek anında çalışan bir
// "oku, boşsa ekle" deseni önceden burada denenmiş ama build sırasında sayfa
// birden fazla kez eşzamanlı render edildiğinde yarış durumuna (aynı
// görsellerin iki kez eklenmesine) yol açtığı için kaldırıldı. İlk kurulum
// varsayılanları artık yalnızca prisma/seed.ts üzerinden, tek seferlik ekleniyor.
export async function getGaleriGorselleri() {
  return db.galeriGorseli.findMany({ orderBy: { sira: "asc" } });
}

// "Metin\nMetin\nMetin" -> ["Metin", "Metin", "Metin"] — boş satırlar atlanır.
export function satirlaraAyir(metin: string): string[] {
  return metin
    .split("\n")
    .map((satir) => satir.trim())
    .filter(Boolean);
}

// Bio gibi çok paragraflı metinler için — boş satırla ayrılmış paragraflar.
export function paragraflaraAyir(metin: string): string[] {
  return metin
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

export const PARA_BIRIMLERI = ["TRY", "USD", "EUR"] as const;
export type ParaBirimi = (typeof PARA_BIRIMLERI)[number];

export const PARA_BIRIMI_GOSTERIMLERI = ["ONCE_SEMBOL", "SONRA_SEMBOL", "KOD"] as const;
export type ParaBirimiGosterimi = (typeof PARA_BIRIMI_GOSTERIMLERI)[number];

const PARA_BIRIMI_SEMBOLU: Record<ParaBirimi, string> = { TRY: "₺", USD: "$", EUR: "€" };

// Locale -> Intl.NumberFormat/DateTimeFormat etiketi. "en" bilerek en-GB
// (en-US değil): gün/ay sırası diğer iki dille (tr-TR, az-AZ) tutarlı kalsın
// diye (social projesindeki aynı gerekçe).
const INTL_ETIKETI: Record<AppLocale, string> = { tr: "tr-TR", en: "en-GB", az: "az-AZ" };
export function intlEtiketi(locale: AppLocale): string {
  return INTL_ETIKETI[locale];
}

// Ekranda gösterilecek fiyat metnini üretir — Iyzico'ya giden gerçek tutarı
// ETKİLEMEZ, yalnızca sitede/admin önizlemesinde nasıl göründüğünü belirler
// (bkz. prisma/schema.prisma > SiteSettings.paraBirimi notu).
export function formatFiyat(
  tutar: number | string,
  ayarlar: { paraBirimi: string; paraBirimiGosterimi: string },
  locale: AppLocale = "tr"
): string {
  const sayi = typeof tutar === "string" ? Number(tutar) : tutar;
  const paraBirimi = (PARA_BIRIMLERI as readonly string[]).includes(ayarlar.paraBirimi)
    ? (ayarlar.paraBirimi as ParaBirimi)
    : "TRY";
  const sembol = PARA_BIRIMI_SEMBOLU[paraBirimi];
  const sayiMetni = new Intl.NumberFormat(intlEtiketi(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(sayi) ? sayi : 0);

  switch (ayarlar.paraBirimiGosterimi) {
    case "SONRA_SEMBOL":
      return `${sayiMetni} ${sembol}`;
    case "KOD":
      return `${paraBirimi} ${sayiMetni}`;
    case "ONCE_SEMBOL":
    default:
      return `${sembol}${sayiMetni}`;
  }
}
