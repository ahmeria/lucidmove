import Link from "next/link";

// Admin panelin tek kart bileşeni — tüm içerik/form bölümleri bunun içine
// alınır (tam genişlik, yumuşak gölge). Stat kartları için bkz. StatKart.
// dolgu={false}: tablo gibi kenardan-kenara içerikler için iç boşluksuz varyant.
export default function Kart({
  children,
  className = "",
  baslik,
  dolgu = true,
}: {
  children: React.ReactNode;
  className?: string;
  baslik?: string;
  dolgu?: boolean;
}) {
  return (
    <div className={`w-full bg-kart border border-cizgi rounded-2xl shadow-organik ${dolgu ? "p-7" : ""} ${className}`}>
      {baslik && <h2 className={`font-display text-xl font-bold text-metin mb-6 ${dolgu ? "" : "px-7 pt-7"}`}>{baslik}</h2>}
      {children}
    </div>
  );
}

const RENK_SINIFLARI = {
  vurgu: { rozet: "bg-vurgu/10 text-vurgu-dark", leke: "bg-vurgu" },
  ikincil: { rozet: "bg-ikincil/10 text-ikincil", leke: "bg-ikincil" },
  hata: { rozet: "bg-hata/10 text-hata", leke: "bg-hata" },
  amber: { rozet: "bg-amber-500/10 text-amber-600", leke: "bg-amber-500" },
} as const;

// Panel'deki (ve diğer sayfalardaki) özet sayı kartları — köşede yumuşak,
// bulanık bir renk lekesi (organik dokunuş) ve konuyla eşleşen bir ikon
// rozeti taşıyor; önceki düz/tek-nokta sürümden daha "modern dashboard".
export function StatKart({
  etiket,
  deger,
  renk = "vurgu",
  href,
  altYazi,
  ikon: Ikon,
}: {
  etiket: string;
  deger: string | number;
  renk?: keyof typeof RENK_SINIFLARI;
  href?: string;
  altYazi?: string;
  ikon: (props: { className?: string }) => React.JSX.Element;
}) {
  const { rozet, leke } = RENK_SINIFLARI[renk];
  const icerik = (
    <div
      className={`relative w-full overflow-hidden bg-kart rounded-2xl border border-cizgi shadow-organik p-6 ${
        href ? "hover:shadow-organik-hover hover:-translate-y-0.5 transition-all" : ""
      }`}
    >
      <span className={`absolute -top-8 -right-8 size-24 rounded-full ${leke} opacity-[0.08] blur-xl`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-metin/45 truncate">{etiket}</p>
          <p className="font-display text-[26px] leading-tight font-bold text-metin mt-2">{deger}</p>
          {altYazi && <p className="font-body text-xs text-metin/40 mt-1.5">{altYazi}</p>}
        </div>
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${rozet}`}>
          <Ikon className="size-5" />
        </span>
      </div>
    </div>
  );

  return href ? <Link href={href}>{icerik}</Link> : icerik;
}
