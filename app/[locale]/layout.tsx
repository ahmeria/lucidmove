import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import "../globals.css";
import { fontDegiskenleri } from "@/lib/fonts";
import Providers from "@/components/Providers";
import { getSiteSettings } from "@/lib/settings";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import { routing, type AppLocale } from "@/i18n/routing";

// Site (locale'li) tarafının BAĞIMSIZ kök layout'u — kendi <html>/<body>'sini
// basıyor. app/admin/** bunun dışında, kendi bağımsız kök layout'unu kullanıyor
// (bkz. app/admin/layout.tsx) — Next.js'in "birden fazla kök layout" deseni:
// paylaşılan tek bir app/layout.tsx artık YOK, her üst-seviye dal kendi
// <html>'ini basıyor, admin hiçbir zaman locale önekine/context'ine girmiyor.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const ayarlar = await getSiteSettings();
  const l = (hasLocale(routing.locales, locale) ? locale : routing.defaultLocale) as AppLocale;
  return {
    title: cevrilenAlan(ayarlar.siteBasligi, ayarlar.siteBasligiEn, ayarlar.siteBasligiAz, l),
    description: cevrilenAlan(ayarlar.siteAciklamasi, ayarlar.siteAciklamasiEn, ayarlar.siteAciklamasiAz, l),
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

  return (
    <html lang={locale} className={fontDegiskenleri}>
      <body className="font-body bg-zemin text-metin">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
