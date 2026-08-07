import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getSiteSettings, getInstructorProfile } from "@/lib/settings";
import Kart from "@/components/admin/Kart";
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
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Yönetim</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-6">Genel Ayarlar</h1>

      <AyarlarSekmeleri />

      <div className="space-y-6">
        <Kart baslik="Para Birimi">
          <ParaBirimiForm paraBirimi={ayarlar.paraBirimi} paraBirimiGosterimi={ayarlar.paraBirimiGosterimi} />
        </Kart>

        <Kart baslik="Google Analytics">
          <GoogleAnalyticsForm gaMeasurementId={ayarlar.gaMeasurementId} />
        </Kart>

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
