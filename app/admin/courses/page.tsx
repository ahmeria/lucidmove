import Link from "next/link";
import { db } from "@/lib/db";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import KursListesi from "./KursListesi";

export const dynamic = "force-dynamic";

export default async function AdminKurslar() {
  const kurslar = await db.course.findMany({
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { lessons: true } } },
  });

  return (
    <div>
      <SayfaBasligi
        sag={
          <Link
            href="/admin/courses/new"
            className="bg-metin text-zemin px-5 py-2.5 rounded-lg font-body text-sm hover:bg-koyu transition-colors cursor-pointer"
          >
            Yeni kurs
          </Link>
        }
      />

      <KursListesi
        kurslar={kurslar.map((k) => ({
          id: k.id,
          baslik: k.baslik,
          seviye: k.seviye,
          kapakUrl: k.kapakUrl,
          dersSayisi: k._count.lessons,
        }))}
      />
    </div>
  );
}
