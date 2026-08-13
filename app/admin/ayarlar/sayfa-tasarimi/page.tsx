import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getSiteSettings, getInstructorProfile, getGaleriGorselleri } from "@/lib/settings";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import EgitmenForm from "../EgitmenForm";
import AnaSayfaMetinleriForm from "./AnaSayfaMetinleriForm";
import GaleriYonetimi from "./GaleriYonetimi";

export const dynamic = "force-dynamic";

// Anasayfanın görsel/metin içeriği için tek, detaylı sayfa — genel Ayarlar
// sayfasındaki (Para Birimi, Google Analytics, İletişim, SEO) sistem
// ayarlarından ayrı tutuluyor. Hero, Üyelik başlığı, Eğitmen profili
// (Hakkımda bölümü) ve Galeri buradan yönetilir; hepsi görsel yükleme
// destekliyor (ham URL yapıştırmak yerine).
export default async function SayfaTasarimi() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const [ayarlar, profil, galeri] = await Promise.all([
    getSiteSettings(),
    getInstructorProfile(),
    getGaleriGorselleri(),
  ]);

  return (
    <div>
      <SayfaBasligi sag={<AyarlarSekmeleri />} />

      <div className="space-y-6">
        <Kart baslik="Hero & Üyelik">
          <AnaSayfaMetinleriForm ayarlar={ayarlar} />
        </Kart>

        <Kart baslik="Eğitmen Profili — Hakkımda bölümü">
          <EgitmenForm profil={profil} />
        </Kart>

        <Kart baslik="Galeri — Stüdyodan kareler">
          <GaleriYonetimi gorseller={galeri} />
        </Kart>
      </div>
    </div>
  );
}
