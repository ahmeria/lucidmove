import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import YeniUyeFormu from "./YeniUyeFormu";

export const dynamic = "force-dynamic";

export default function YeniUye() {
  return (
    <div>
      <SayfaBasligi
        sag={
          <a href="/admin/members" className="font-body text-sm text-metin/60 hover:text-metin transition-colors">
            ← Üyelere dön
          </a>
        }
      />
      <Kart>
        <YeniUyeFormu />
      </Kart>
    </div>
  );
}
