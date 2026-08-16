import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { getSiteSettings } from "@/lib/settings";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "./AyarlarSekmeleri";
import ParaBirimiForm from "./ParaBirimiForm";
import DilAyarForm from "./DilAyarForm";

export const dynamic = "force-dynamic";

// Ana sayfanın içerik/görsel tasarımı (Hero, Üyelik başlığı, Eğitmen profili,
// Site & İletişim, Galeri) burada değil — bkz. /admin/settings/page-design.
// Google Analytics de burada değil — bkz. /admin/settings/integrations.
// Burası yalnızca sistem geneli ayarlar: para birimi, dil.
export default async function AdminAyarlar() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings")) notFound();

  const ayarlar = await getSiteSettings();

  return (
    <div>
      <SayfaBasligi
        sag={<AyarlarSekmeleri sistemYoneticisiMi={session.sistemYoneticisiMi} izinliSayfalar={session.izinliSayfalar} />}
      />

      <div className="space-y-6">
        <Kart baslik="Para Birimi">
          <ParaBirimiForm paraBirimi={ayarlar.paraBirimi} paraBirimiGosterimi={ayarlar.paraBirimiGosterimi} />
        </Kart>

        <Kart baslik="Dil">
          <DilAyarForm varsayilanDil={ayarlar.varsayilanDil} />
        </Kart>
      </div>
    </div>
  );
}
