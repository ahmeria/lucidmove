import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import KursForm from "../../KursForm";
import DersYonetimi from "./DersYonetimi";
import KursSekmeleri from "./KursSekmeleri";

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
      <KursSekmeleri
        dersSayisi={kurs.lessons.length}
        bilgiler={
          <Kart baslik="Kurs bilgileri">
            <KursForm kurs={kurs} kategoriler={kategoriler} />
          </Kart>
        }
        dersler={
          <Kart baslik="Dersler">
            <DersYonetimi courseId={kurs.id} dersler={kurs.lessons} />
          </Kart>
        }
      />
    </div>
  );
}
