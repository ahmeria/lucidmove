import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import KursForm from "../KursForm";

export const dynamic = "force-dynamic";

export default async function YeniKurs() {
  const kategoriler = await db.category.findMany({ orderBy: { sira: "asc" }, select: { id: true, ad: true } });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Yönetim</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-8">Yeni kurs</h1>
      <Kart>
        <KursForm kategoriler={kategoriler} />
      </Kart>
    </div>
  );
}
