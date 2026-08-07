import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import KursForm from "../../KursForm";
import DersYonetimi from "./DersYonetimi";

export const dynamic = "force-dynamic";

export default async function KursDuzenle({ params }: { params: { id: string } }) {
  const [kurs, kategoriler] = await Promise.all([
    db.course.findUnique({
      where: { id: params.id },
      include: { lessons: { orderBy: [{ sira: "asc" }, { createdAt: "asc" }] } },
    }),
    db.category.findMany({ orderBy: { sira: "asc" }, select: { id: true, ad: true } }),
  ]);
  if (!kurs) notFound();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Yönetim</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-8">{kurs.baslik}</h1>

      <div className="space-y-6">
        <Kart baslik="Kurs bilgileri">
          <KursForm kurs={kurs} kategoriler={kategoriler} />
        </Kart>

        <Kart baslik="Dersler">
          <DersYonetimi courseId={kurs.id} dersler={kurs.lessons} />
        </Kart>
      </div>
    </div>
  );
}
