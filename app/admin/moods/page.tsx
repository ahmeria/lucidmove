import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import MoodYonetimi from "./MoodYonetimi";

export const dynamic = "force-dynamic";

// Ders "mood" (ruh hali) etiketlerinin CRUD'u — bkz. app/(site)/courses
// (herkese açık "Moodlar" bölümü) ve DersYonetimi.tsx (ders formundaki
// "Mood" seçimi). Kategoriler gibi bir taksonomi değil: sabit, küçük bir
// liste, ama artık admin panelinden eklenip düzenlenebiliyor.
export default async function AdminMoodlar() {
  const moodlar = await db.mood.findMany({ orderBy: { sira: "asc" } });

  return (
    <div>
      <Kart baslik="Moodlar">
        <MoodYonetimi moodlar={moodlar} />
      </Kart>
    </div>
  );
}
