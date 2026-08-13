import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import ManuelOdemeFormu from "./ManuelOdemeFormu";

export const dynamic = "force-dynamic";

export default async function ManuelOdeme() {
  const [kullanicilar, planlar] = await Promise.all([
    db.user.findMany({
      where: { role: "UYE" },
      orderBy: { ad: "asc" },
      select: { id: true, ad: true, email: true },
    }),
    db.pricingPlan.findMany({ select: { plan: true, fiyat: true } }),
  ]);

  return (
    <div>
      <SayfaBasligi
        sag={
          <a href="/admin/subscriptions" className="font-body text-sm text-metin/60 hover:text-metin transition-colors">
            ← Üyeliklere dön
          </a>
        }
      />
      <Kart>
        <ManuelOdemeFormu
          kullanicilar={kullanicilar}
          planFiyatlari={Object.fromEntries(planlar.map((p) => [p.plan, p.fiyat.toString()]))}
        />
      </Kart>
    </div>
  );
}
