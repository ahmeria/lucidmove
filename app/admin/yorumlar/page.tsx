import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import YorumYonetimi from "./YorumYonetimi";

export const dynamic = "force-dynamic";

// Anasayfadaki "Pratikleriyle değişenler" bölümünün içerik yönetimi (bkz.
// app/(site)/page.tsx > YORUMLAR). Birden fazla kayıt olduğunda o bölüm
// otomatik olarak yatayda kaydırılabilir bir şeride dönüşür.
export default async function AdminYorumlar() {
  const yorumlar = await db.testimonial.findMany({
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <Kart baslik="Pratikleriyle değişenler">
        <YorumYonetimi yorumlar={yorumlar} />
      </Kart>
    </div>
  );
}
