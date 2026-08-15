import Image from "next/image";
import Link from "next/link";

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

// Üyelik panelindeki her kurs için: kapak + seviye + başlık + ilerleme çubuğu
// (bu kullanıcının o kurstaki tamamlanan/toplam ders sayısına göre).
export default function KursIlerlemeKarti({
  kurs,
}: {
  kurs: { slug: string; baslik: string; seviye: string; kapakUrl: string | null; toplam: number; tamamlanan: number };
}) {
  const yuzde = kurs.toplam > 0 ? Math.round((kurs.tamamlanan / kurs.toplam) * 100) : 0;
  const tamamlandiMi = kurs.toplam > 0 && kurs.tamamlanan === kurs.toplam;

  return (
    <Link
      href={`/courses/${kurs.slug}`}
      className="group block bg-kart border border-cizgi rounded-2xl overflow-hidden shadow-organik hover:shadow-organik-hover hover:border-ikincil transition-all"
    >
      <div className="relative aspect-[4/3] bg-zemin overflow-hidden">
        {kurs.kapakUrl ? (
          <Image
            src={kurs.kapakUrl}
            alt={kurs.baslik}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-metin/20">
            <BosResimIkonu className="size-9" />
          </span>
        )}
        {tamamlandiMi && (
          <span className="absolute top-3 right-3 bg-vurgu text-white text-[11px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full">
            Tamamlandı
          </span>
        )}
      </div>
      <div className="p-5">
        <span className="font-mono text-[11px] text-ikincil-dark uppercase tracking-wide">{kurs.seviye}</span>
        <h3 className="font-display text-lg font-bold text-metin mt-1.5 line-clamp-1">{kurs.baslik}</h3>

        <div className="mt-4">
          <div className="h-1.5 bg-zemin rounded-full overflow-hidden">
            <div
              className="h-full bg-vurgu rounded-full transition-[width] duration-300"
              style={{ width: `${yuzde}%` }}
            />
          </div>
          <p className="font-mono text-[11px] text-metin/45 mt-2">
            {kurs.toplam > 0 ? `${kurs.tamamlanan} / ${kurs.toplam} ders · %${yuzde}` : "Henüz ders eklenmedi"}
          </p>
        </div>
      </div>
    </Link>
  );
}
