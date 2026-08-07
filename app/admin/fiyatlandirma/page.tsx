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
              fiyat: p.fiyat.toString(),
              periyot: p.periyot,
              aciklama: p.aciklama,
              ozellikler: p.ozellikler,
              rozet: p.rozet,
              vurgulu: p.vurgulu,
              sira: p.sira,
            }}
          />
        ))}
      </div>
    </div>
  );
}
