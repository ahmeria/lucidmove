import { db } from "@/lib/db";
import FiyatForm from "./FiyatForm";

export const dynamic = "force-dynamic";

export default async function AdminFiyatlandirma() {
  const planlar = await db.pricingPlan.findMany({ orderBy: { sira: "asc" } });

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-6">
        {planlar.map((p) => (
          <FiyatForm
            key={p.id}
            plan={{
              id: p.id,
              plan: p.plan,
              baslik: p.baslik,
              baslikEn: p.baslikEn,
              baslikAz: p.baslikAz,
              fiyat: p.fiyat.toString(),
              periyot: p.periyot,
              periyotEn: p.periyotEn,
              periyotAz: p.periyotAz,
              aciklama: p.aciklama,
              aciklamaEn: p.aciklamaEn,
              aciklamaAz: p.aciklamaAz,
              ozellikler: p.ozellikler,
              ozelliklerEn: p.ozelliklerEn,
              ozelliklerAz: p.ozelliklerAz,
              rozet: p.rozet,
              rozetEn: p.rozetEn,
              rozetAz: p.rozetAz,
              vurgulu: p.vurgulu,
              sira: p.sira,
            }}
          />
        ))}
      </div>
    </div>
  );
}
