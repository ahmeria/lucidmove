import Script from "next/script";
import { getLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import { yayindaKampVarMi } from "@/lib/kamplar";
import { yayindaOzelDersVarMi } from "@/lib/ozelDersler";
import type { AppLocale } from "@/i18n/routing";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [ayarlar, locale, kampVarMi, ozelDersVarMi] = await Promise.all([
    getSiteSettings(),
    getLocale(),
    yayindaKampVarMi(),
    yayindaOzelDersVarMi(),
  ]);
  const l = locale as AppLocale;

  return (
    <div className="flex flex-col min-h-screen">
      {ayarlar.gaMeasurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ayarlar.gaMeasurementId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ayarlar.gaMeasurementId}');`}
          </Script>
        </>
      )}
      <Navbar kampVarMi={kampVarMi} ozelDersVarMi={ozelDersVarMi} />
      <main className="flex-1">{children}</main>
      <Footer
        footerTagline={cevrilenAlan(ayarlar.footerTagline, ayarlar.footerTaglineEn, ayarlar.footerTaglineAz, l)}
        calismaSaatleri={cevrilenAlan(ayarlar.calismaSaatleri, ayarlar.calismaSaatleriEn, ayarlar.calismaSaatleriAz, l)}
        iletisimEmail={ayarlar.iletisimEmail}
        instagramUrl={ayarlar.instagramUrl}
        kampVarMi={kampVarMi}
        ozelDersVarMi={ozelDersVarMi}
      />
    </div>
  );
}
