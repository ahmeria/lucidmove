import Link from "next/link";
import { db } from "@/lib/db";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import OzelDersListesi from "./OzelDersListesi";

export const dynamic = "force-dynamic";

export default async function AdminOzelDersler() {
  const dersler = await db.privateLesson.findMany({
    orderBy: { sira: "asc" },
    include: { _count: { select: { videos: true } } },
  });

  return (
    <div>
      <SayfaBasligi
        sag={
          <Link
            href="/admin/private-lessons/new"
            className="bg-metin text-zemin px-5 py-2.5 rounded-lg font-body text-sm hover:bg-koyu transition-colors cursor-pointer"
          >
            Yeni özel ders
          </Link>
        }
      />

      <OzelDersListesi
        dersler={dersler.map((d) => ({
          id: d.id,
          baslik: d.baslik,
          fiyat: d.fiyat.toString(),
          kapakUrl: d.kapakUrl,
          yayindaMi: d.yayindaMi,
          videoSayisi: d._count.videos,
        }))}
      />
    </div>
  );
}
