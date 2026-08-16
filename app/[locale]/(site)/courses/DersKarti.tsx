import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface DersKartiVerisi {
  id: string;
  slug: string;
  baslik: string;
  kapakUrl: string | null;
  sureDakika: number;
  mood: string | null;
  moodEtiket: string | null;
  ucretsizMi: boolean;
}

function KilitIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" strokeLinecap="round" />
    </svg>
  );
}

// Tek bir dersin kartı — görsel + altında başlık + küçük bir metadata satırı
// (süre · seviye · mood). Aktif üyeliği olmayan ziyaretçiye (ücretsiz tanıtım
// hariç) üzerine gelince kilit + "Üye ol" çıkar. Hem kurs kataloğunda (bkz.
// KursKatalogu.tsx) hem tek kurs sayfasında (bkz. [slug]/page.tsx) aynı
// görsel dili korumak için paylaşılan tek bir bileşen — client bileşeni
// olması gerekmiyor, ikisinde de doğrudan kullanılabiliyor. Çevrilmiş
// metinler (dakika kısaltması, "Üye ol") next-intl hook'u burada değil,
// çağıran taraf(lar)da çözülüp prop olarak geçiriliyor — bu bileşen hem
// client (KursKatalogu) hem server (kurs detay sayfası) bağlamından
// kullanıldığı için tek bir çeviri API'sine bağımlı kalmasın diye.
export default function DersKarti({
  ders,
  kursSlug,
  kursSeviye,
  uyeMi,
  dkEtiketi,
  uyeOlEtiketi,
}: {
  ders: DersKartiVerisi;
  kursSlug: string;
  kursSeviye: string;
  uyeMi: boolean;
  dkEtiketi: string;
  uyeOlEtiketi: string;
}) {
  const erisilebilir = uyeMi || ders.ucretsizMi;

  return (
    <Link href={`/courses/${kursSlug}/${ders.slug}`} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zemin border border-cizgi">
        {ders.kapakUrl && (
          <Image
            src={ders.kapakUrl}
            alt={ders.baslik}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {!erisilebilir && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-koyu/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <KilitIkonu className="size-6 text-white" />
            <span className="font-body text-sm font-medium text-white">{uyeOlEtiketi}</span>
          </div>
        )}
      </div>
      <div className="mt-3.5">
        <h4 className="font-display text-lg font-bold text-metin line-clamp-1">{ders.baslik}</h4>
        <p className="font-body text-sm text-metin/50 mt-1">
          {ders.sureDakika} {dkEtiketi} · {kursSeviye}
          {ders.moodEtiket ? ` · ${ders.moodEtiket}` : ""}
        </p>
      </div>
    </Link>
  );
}
