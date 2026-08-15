import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { getSiteSettings } from "@/lib/settings";
import { analitikAyarlariniAl } from "@/lib/analitikVerisi";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "./AyarlarSekmeleri";
import SiteAyarlariForm from "./SiteAyarlariForm";
import ParaBirimiForm from "./ParaBirimiForm";
import GoogleAnalyticsForm from "./GoogleAnalyticsForm";

export const dynamic = "force-dynamic";

// Ana sayfanın içerik/görsel tasarımı (Hero, Üyelik başlığı, Eğitmen profili,
// Galeri) burada değil — bkz. /admin/settings/page-design. Burası sistem
// geneli ayarlar: para birimi, analitik, iletişim bilgisi, SEO.
export default async function AdminAyarlar() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings")) notFound();

  const [ayarlar, analitik] = await Promise.all([getSiteSettings(), analitikAyarlariniAl()]);

  return (
    <div>
      <SayfaBasligi
        sag={<AyarlarSekmeleri sistemYoneticisiMi={session.sistemYoneticisiMi} izinliSayfalar={session.izinliSayfalar} />}
      />

      <div className="space-y-6">
        <Kart baslik="Para Birimi">
          <ParaBirimiForm paraBirimi={ayarlar.paraBirimi} paraBirimiGosterimi={ayarlar.paraBirimiGosterimi} />
        </Kart>

        {/* Data API kurulum adımları eklenince bu kart hayli uzadı — Para
            Birimi'yle yan yana sıkıştırmak yerine tam genişlik tek başına. */}
        <Kart baslik="Google Analytics">
          <GoogleAnalyticsForm
            gaMeasurementId={ayarlar.gaMeasurementId}
            gaPropertyId={analitik.propertyId}
            servisHesabiVarMi={analitik.servisHesabiVarMi}
            servisHesabiEmail={analitik.servisHesabiEmail}
          />
        </Kart>

        <Kart baslik="Site & İletişim">
          <SiteAyarlariForm ayarlar={ayarlar} />
        </Kart>
      </div>
    </div>
  );
}
