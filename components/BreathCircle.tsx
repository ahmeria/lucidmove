// İmza görsel öğe: yavaşça genişleyip daralan "nefes çemberi".
// Site genelinde 7 saniyelik bir döngüyle (yaklaşık 4 sn nefes alma, 3 sn verme
// hissi verecek şekilde) tekrar eder — sayfanın sakin ritmini kurar.

export function BreathCircleHero() {
  return (
    <div
      aria-hidden="true"
      className="relative flex items-center justify-center w-[280px] h-[280px] sm:w-[380px] sm:h-[380px]"
    >
      <div className="absolute inset-0 rounded-full border border-ikincil/30" />
      <div className="absolute inset-[14%] rounded-full border border-vurgu/35" />
      <div className="absolute inset-[28%] rounded-full bg-ikincil/20 animate-breathe" />
      <div className="absolute inset-[38%] rounded-full bg-vurgu/75 animate-breathe [animation-delay:0.4s]" />
      <span className="relative font-mono text-[11px] tracking-[0.25em] uppercase text-metin/60">
        nefes al · ver
      </span>
    </div>
  );
}

// Nav çubuğunda tekrar eden küçük nefes noktası — sayfanın ritim motifini
// gezinme sırasında da hissettirir.
export function BreatheDot() {
  return (
    <span
      aria-hidden="true"
      className="inline-block w-2 h-2 rounded-full bg-vurgu animate-breatheSmall"
    />
  );
}
