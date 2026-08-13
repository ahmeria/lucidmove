import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import KursSilButonu from "./KursSilButonu";

export const dynamic = "force-dynamic";

function BosResimIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path
        d="m4.5 16 4.5-4.5a1.5 1.5 0 0 1 2.1 0l2.4 2.4M13.5 13.2 15 11.7a1.5 1.5 0 0 1 2.1 0l1.9 1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

      {kurslar.length === 0 ? (
        <p className="font-body text-metin/60">Henüz kurs yok.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kurslar.map((k) => (
            <div
              key={k.id}
              className="group bg-kart border border-cizgi rounded-2xl overflow-hidden shadow-organik hover:shadow-organik-hover transition-all"
            >
              <Link href={`/admin/courses/${k.id}/edit`} className="block">
                <div className="relative aspect-[4/3] bg-zemin overflow-hidden">
                  {k.kapakUrl ? (
                    <Image
                      src={k.kapakUrl}
                      alt={k.baslik}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-metin/20">
                      <BosResimIkonu className="size-9" />
                    </span>
                  )}
                </div>
                <div className="p-5 pb-3">
                  <span className="font-mono text-[11px] text-ikincil-dark uppercase tracking-wide">{k.seviye}</span>
                  <h3 className="font-display text-base font-bold text-metin mt-1.5 line-clamp-1">{k.baslik}</h3>
                  <p className="font-mono text-xs text-metin/45 mt-2">
                    {k._count.lessons} ders · Sıra {k.sira}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between px-5 py-3 border-t border-cizgi">
                <Link
                  href={`/admin/courses/${k.id}/edit`}
                  className="font-body text-sm text-vurgu hover:text-vurgu-dark"
                >
                  Düzenle
                </Link>
                <KursSilButonu kursId={k.id} kursBaslik={k.baslik} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
