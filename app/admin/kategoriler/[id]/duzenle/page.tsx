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
      <Kart>
        <KategoriForm kategori={kategori} />
      </Kart>
    </div>
  );
}
