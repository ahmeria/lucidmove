function CekIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface PricingCardProps {
  baslik: string;
  fiyat: string;
  periyot: string;
  aciklama: string;
  rozet?: string | null;
  vurgu?: boolean;
  ozellikler: string[];
  onSec: () => void;
  yukleniyor: boolean;
}

export default function PricingCard({
  baslik,
  fiyat,
  periyot,
  aciklama,
  rozet,
  vurgu,
  ozellikler,
  onSec,
  yukleniyor,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-[1.5rem] p-8 border flex flex-col shadow-organik hover:shadow-organik-hover transition-shadow ${
        vurgu ? "bg-metin text-zemin border-metin" : "bg-kart text-metin border-cizgi"
      }`}
    >
      {rozet && (
        <span className="inline-block self-start font-mono text-[11px] tracking-[0.2em] uppercase bg-vurgu text-zemin px-3 py-1 rounded-full mb-4">
          {rozet}
        </span>
      )}
      <h3 className="font-display text-2xl font-bold">{baslik}</h3>
      <p className={`font-body text-sm mt-1.5 ${vurgu ? "text-zemin/60" : "text-metin/60"}`}>{aciklama}</p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-bold">{fiyat}</span>
        <span className={`font-body text-sm ${vurgu ? "text-zemin/50" : "text-metin/50"}`}>{periyot}</span>
      </div>

      <ul className="mt-7 space-y-3 font-body text-sm flex-1">
        {ozellikler.map((o) => (
          <li key={o} className="flex items-start gap-2.5">
            <CekIkonu className={`size-4 mt-0.5 shrink-0 ${vurgu ? "text-vurgu-light" : "text-vurgu"}`} />
            <span className={vurgu ? "text-zemin/85" : "text-metin/80"}>{o}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSec}
        disabled={yukleniyor}
        className={`mt-8 w-full rounded-full py-3.5 font-body text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
          vurgu ? "bg-vurgu text-zemin hover:bg-vurgu-dark" : "bg-metin text-zemin hover:bg-koyu"
        }`}
      >
        {yukleniyor ? "Yönlendiriliyor…" : "Bu planı seç"}
      </button>
    </div>
  );
}
