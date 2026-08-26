import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import OzelDersForm from "../../OzelDersForm";
import OzelDersVideoYonetimi from "./OzelDersVideoYonetimi";
import OzelDersSekmeleri from "./OzelDersSekmeleri";

export const dynamic = "force-dynamic";

export default async function OzelDersDuzenle({ params }: { params: { id: string } }) {
  const ders = await db.privateLesson.findUnique({
    where: { id: params.id },
    include: { videos: { orderBy: [{ sira: "asc" }, { createdAt: "asc" }] } },
  });
  if (!ders) notFound();

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/private-lessons/${ders.id}/purchases`}
        className="font-body text-sm text-vurgu hover:text-vurgu-dark inline-block"
      >
        → Satın alanları görüntüle
      </Link>

      <OzelDersSekmeleri
        videoSayisi={ders.videos.length}
        bilgiler={
          <Kart baslik="Özel ders bilgileri">
            <OzelDersForm ders={{ ...ders, fiyat: ders.fiyat.toString() }} />
          </Kart>
        }
        videolar={
          <Kart baslik="Videolar">
            <OzelDersVideoYonetimi privateLessonId={ders.id} videolar={ders.videos} />
          </Kart>
        }
      />
    </div>
  );
}
