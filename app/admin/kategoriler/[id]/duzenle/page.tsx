import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import KategoriForm from "../../KategoriForm";

export const dynamic = "force-dynamic";

export default async function KategoriDuzenle({ params }: { params: { id: string } }) {
  const kategori = await db.category.findUnique({ where: { id: params.id } });
  if (!kategori) notFound();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Yönetim</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-8">{kategori.ad}</h1>
      <Kart>
        <KategoriForm kategori={kategori} />
      </Kart>
    </div>
  );
}
