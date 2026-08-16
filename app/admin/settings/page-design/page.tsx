import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { getSiteSettings, getInstructorProfile, getGaleriGorselleri } from "@/lib/settings";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import EgitmenForm from "../EgitmenForm";
import SiteAyarlariForm from "../SiteAyarlariForm";
import AnaSayfaMetinleriForm from "./AnaSayfaMetinleriForm";
import GaleriYonetimi from "./GaleriYonetimi";

export const dynamic = "force-dynamic";

// Anasayfanın görsel/metin içeriği için tek, detaylı sayfa — genel Ayarlar
// sayfasındaki (Para Birimi, Google Analytics) sistem ayarlarından ayrı
// tutuluyor. Hero, Üyelik başlığı, Eğitmen profili (Hakkımda bölümü), Site &
// İletişim ve Galeri buradan yönetilir. Çevrilebilir metin alanları (bkz.
// DilSekmeli) burada TR/EN/AZ olarak girilebiliyor — frontend /en, /az
// sürümlerinde bunları gösteriyor (admin arayüzünün kendisi hep Türkçe).
export default async function SayfaTasarimi() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/page-design")) notFound();

  const [ayarlar, profil, galeri] = await Promise.all([
    getSiteSettings(),
    getInstructorProfile(),
    getGaleriGorselleri(),
  ]);

  return (
    <div>
      <SayfaBasligi
        sag={<AyarlarSekmeleri sistemYoneticisiMi={session.sistemYoneticisiMi} izinliSayfalar={session.izinliSayfalar} />}
      />

      <div className="space-y-6">
        <Kart baslik="Hero & Üyelik">
          <AnaSayfaMetinleriForm ayarlar={ayarlar} />
        </Kart>

        <Kart baslik="Eğitmen Profili — Hakkımda bölümü">
          <EgitmenForm profil={profil} />
        </Kart>

        <Kart baslik="Site & İletişim">
          <SiteAyarlariForm ayarlar={ayarlar} />
        </Kart>

        <Kart baslik="Galeri — Stüdyodan kareler">
          <GaleriYonetimi gorseller={galeri} />
        </Kart>
      </div>
    </div>
  );
}
