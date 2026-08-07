import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const ayarlar = await getSiteSettings();

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
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer ayarlar={ayarlar} />
    </div>
  );
}
