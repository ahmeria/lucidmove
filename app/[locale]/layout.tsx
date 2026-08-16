import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import "../globals.css";
import { fontDegiskenleri } from "@/lib/fonts";
import Providers from "@/components/Providers";
import { getSiteSettings } from "@/lib/settings";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import { routing, type AppLocale } from "@/i18n/routing";
import { SITE_URL, localeUrl, localeAlternates, ogLocale } from "@/lib/seo";

// Site (locale'li) tarafının BAĞIMSIZ kök layout'u — kendi <html>/<body>'sini
// basıyor. app/admin/** bunun dışında, kendi bağımsız kök layout'unu kullanıyor
// (bkz. app/admin/layout.tsx) — Next.js'in "birden fazla kök layout" deseni:
// paylaşılan tek bir app/layout.tsx artık YOK, her üst-seviye dal kendi
// <html>'ini basıyor, admin hiçbir zaman locale önekine/context'ine girmiyor.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// NOT: Bu, tüm [locale] alt ağacının kök layout'u olduğu için buradaki
// metadata yalnızca anasayfa ("/") için doğrudur (alternates/canonical dahil)
// — kendi generateMetadata'sını tanımlamayan alt sayfalar bunu miras alır,
// bu yüzden index'lenmesi istenen HER alt sayfa (courses/[slug] vb.) kendi
// yoluna göre localeAlternates() ile bunu ezmelidir.
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const ayarlar = await getSiteSettings();
  const l = (hasLocale(routing.locales, locale) ? locale : routing.defaultLocale) as AppLocale;
  const baslik = cevrilenAlan(ayarlar.siteBasligi, ayarlar.siteBasligiEn, ayarlar.siteBasligiAz, l);
  const aciklama = cevrilenAlan(ayarlar.siteAciklamasi, ayarlar.siteAciklamasiEn, ayarlar.siteAciklamasiAz, l);

  return {
    metadataBase: new URL(SITE_URL),
    title: baslik,
    description: aciklama,
    alternates: localeAlternates("/", l),
    openGraph: {
      title: baslik,
      description: aciklama,
      url: localeUrl("/", l),
      siteName: baslik.split("—")[0].trim() || "LucidMove",
      images: [{ url: ayarlar.heroGorselUrl, width: 1800, height: 1013 }],
      locale: ogLocale(l),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: baslik,
      description: aciklama,
      images: [ayarlar.heroGorselUrl],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const ayarlar = await getSiteSettings();

  // Sitewide Organization structured data — arama motorlarına marka
  // adı/logo/iletişim/sosyal hesapları bildiriyor (bkz. schema.org/Organization).
  const organizasyonJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ayarlar.siteBasligi.split("—")[0].trim() || "LucidMove",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: ayarlar.iletisimEmail,
    sameAs: [ayarlar.instagramUrl].filter(Boolean),
  };

  return (
    <html lang={locale} className={fontDegiskenleri}>
      <body className="font-body bg-zemin text-metin">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizasyonJsonLd) }}
        />
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
