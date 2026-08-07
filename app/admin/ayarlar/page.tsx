import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getSiteSettings, getInstructorProfile } from "@/lib/settings";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "./AyarlarSekmeleri";
import SiteAyarlariForm from "./SiteAyarlariForm";
import EgitmenForm from "./EgitmenForm";
import ParaBirimiForm from "./ParaBirimiForm";
import GoogleAnalyticsForm from "./GoogleAnalyticsForm";

export const dynamic = "force-dynamic";

export default async function AdminAyarlar() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const [ayarlar, profil] = await Promise.all([getSiteSettings(), getInstructorProfile()]);

  return (
    <div>
      <SayfaBasligi sag={<AyarlarSekmeleri />} />

      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Kart baslik="Para Birimi">
            <ParaBirimiForm paraBirimi={ayarlar.paraBirimi} paraBirimiGosterimi={ayarlar.paraBirimiGosterimi} />
          </Kart>

          <Kart baslik="Google Analytics">
            <GoogleAnalyticsForm gaMeasurementId={ayarlar.gaMeasurementId} />
          </Kart>
        </div>

        <Kart baslik="Site & İletişim">
          <SiteAyarlariForm ayarlar={ayarlar} />
        </Kart>

        <Kart baslik="Eğitmen Profili">
          <EgitmenForm profil={profil} />
        </Kart>
      </div>
    </div>
  );
}
