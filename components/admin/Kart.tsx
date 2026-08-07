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
  vurgu: { kenar: "border-l-vurgu", wash: "from-vurgu/10" },
  ikincil: { kenar: "border-l-ikincil", wash: "from-ikincil/10" },
  hata: { kenar: "border-l-hata", wash: "from-hata/10" },
  amber: { kenar: "border-l-amber-400", wash: "from-amber-400/10" },
} as const;

// Panel'deki (ve diğer sayfalardaki) özet sayı kartları — sol kenarda renkli
// şerit + hafif renkli geçiş, ekteki referans tasarıma uyarlanmış.
export function StatKart({
  etiket,
  deger,
  renk = "vurgu",
  href,
  altYazi,
}: {
  etiket: string;
  deger: string | number;
  renk?: keyof typeof RENK_SINIFLARI;
  href?: string;
  altYazi?: string;
}) {
  const { kenar, wash } = RENK_SINIFLARI[renk];
  const icerik = (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-r ${wash} to-kart rounded-2xl border border-cizgi border-l-4 ${kenar} shadow-organik p-6 ${
        href ? "hover:shadow-organik-hover transition-shadow" : ""
      }`}
    >
      <p className="font-body text-xs text-metin/50 uppercase tracking-wide">{etiket}</p>
      <p className="font-display text-2xl font-bold text-metin mt-2">{deger}</p>
      {altYazi && <p className="font-body text-xs text-metin/40 mt-1.5">{altYazi}</p>}
    </div>
  );

  return href ? <Link href={href}>{icerik}</Link> : icerik;
}
