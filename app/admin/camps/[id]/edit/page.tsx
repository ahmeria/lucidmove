import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import CampForm from "../../CampForm";

export const dynamic = "force-dynamic";

export default async function KampDuzenle({ params }: { params: { id: string } }) {
  const kamp = await db.camp.findUnique({ where: { id: params.id } });
  if (!kamp) notFound();

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/camps/${kamp.id}/reservations`}
        className="font-body text-sm text-vurgu hover:text-vurgu-dark inline-block"
      >
        → Rezervasyonları görüntüle
      </Link>
      <Kart baslik="Kamp bilgileri">
        <CampForm kamp={{ ...kamp, fiyat: kamp.fiyat.toString() }} />
      </Kart>
    </div>
  );
}
