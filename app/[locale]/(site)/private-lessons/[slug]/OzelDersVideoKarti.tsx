import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface OzelDersVideoKartiVerisi {
  id: string;
  slug: string;
  baslik: string;
  kapakUrl: string | null;
  sureDakika: number;
}

function KilitIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" strokeLinecap="round" />
    </svg>
  );
}

// DersKarti.tsx'in özel ders karşılığı — kasıtlı olarak AYRI bir bileşen
// (DersKarti kurs/üyelik/mood alanlarına sıkı bağlı, mevcut kursu riske
// atmamak için değiştirilmedi). Aynı görsel dil: kapak + hover'da kilit
// overlay'i (satın alınmamışsa) + başlık + süre satırı (mood/seviye yok,
// bu içerik türünde bu kavramlar geçerli değil).
export default function OzelDersVideoKarti({
  video,
  dersSlug,
  satinAlindiMi,
  dkEtiketi,
  satinAlEtiketi,
}: {
  video: OzelDersVideoKartiVerisi;
  dersSlug: string;
  satinAlindiMi: boolean;
  dkEtiketi: string;
  satinAlEtiketi: string;
}) {
  return (
    <Link href={`/private-lessons/${dersSlug}/${video.slug}`} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zemin border border-cizgi">
        {video.kapakUrl && (
          <Image
            src={video.kapakUrl}
            alt={video.baslik}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {!satinAlindiMi && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-koyu/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <KilitIkonu className="size-6 text-white" />
            <span className="font-body text-sm font-medium text-white">{satinAlEtiketi}</span>
          </div>
        )}
      </div>
      <div className="mt-3.5">
        <h4 className="font-display text-lg font-bold text-metin line-clamp-1">{video.baslik}</h4>
        <p className="font-body text-sm text-metin/50 mt-1">
          {video.sureDakika} {dkEtiketi}
        </p>
      </div>
    </Link>
  );
}
