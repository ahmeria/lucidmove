import Link from "next/link";
import { db } from "@/lib/db";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import KategoriSilButonu from "./KategoriSilButonu";

export const dynamic = "force-dynamic";

function KlasorIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M3.5 6.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" strokeLinejoin="round" />
    </svg>
  );
}

export default async function AdminKategoriler() {
  const kategoriler = await db.category.findMany({
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { courses: true } } },
  });

  return (
    <div>
      <SayfaBasligi
        sag={
          <Link
            href="/admin/categories/new"
            className="bg-metin text-zemin px-5 py-2.5 rounded-lg font-body text-sm hover:bg-koyu transition-colors cursor-pointer"
          >
            Yeni kategori
          </Link>
        }
      />

      {kategoriler.length === 0 ? (
        <p className="font-body text-metin/60">Henüz kategori yok.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kategoriler.map((k) => (
            <div
              key={k.id}
              className="bg-kart border border-cizgi rounded-2xl p-6 shadow-organik hover:shadow-organik-hover transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center size-10 rounded-xl bg-vurgu/10 text-vurgu-dark shrink-0">
                  <KlasorIkonu className="size-5" />
                </span>
                <span className="font-mono text-[11px] text-metin/40">Sıra {k.sira}</span>
              </div>

              <h3 className="font-display text-lg font-bold text-metin mt-4 line-clamp-1">{k.ad}</h3>
              {k.aciklama && <p className="font-body text-sm text-metin/60 mt-1.5 line-clamp-2">{k.aciklama}</p>}
              <p className="font-mono text-xs text-metin/45 mt-3">{k._count.courses} kurs</p>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-cizgi">
                <Link
                  href={`/admin/categories/${k.id}/edit`}
                  className="font-body text-sm text-vurgu hover:text-vurgu-dark"
                >
                  Düzenle
                </Link>
                <KategoriSilButonu kategoriId={k.id} kategoriAd={k.ad} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
