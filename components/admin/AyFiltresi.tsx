"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TUM_ZAMANLAR, gosterilecekAy } from "@/lib/ayFiltresi";

const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function ayiCoz(deger: string): { yil: number; ay: number } {
  const [y, a] = deger.split("-").map(Number);
  const simdi = new Date();
  return {
    yil: Number.isInteger(y) ? y : simdi.getFullYear(),
    ay: Number.isInteger(a) && a >= 1 && a <= 12 ? a : simdi.getMonth() + 1,
  };
}
const pad = (n: number) => String(n).padStart(2, "0");

function TakvimIkonu({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2.5" y="3.5" width="15" height="14" rx="2" />
      <path d="M2.5 7.5h15M6.5 2v3M13.5 2v3" />
    </svg>
  );
}

// Raporlar'ın üç sekmesinde ve admin Panel'de kullanılan ortak ay seçici —
// tarayıcının biçimlendirilemeyen <input type="month"> takvimi yerine kendi
// popover'ımız (social projesindeki MonthPicker ile aynı desen, LucidMove
// admin tonlarına uyarlanmış: vurgu rengi, kart/çizgi yüzeyleri). Varsayılan
// olarak BU AY seçili gelir (bkz. lib/ayFiltresi.ts) — "Tüm zamanlar" ayrı,
// açık bir seçenek.
export default function AyFiltresi() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const secili = gosterilecekAy(searchParams.get("ay") ?? undefined);
  const tumZamanlarMi = secili === TUM_ZAMANLAR;

  const [open, setOpen] = useState(false);
  const { yil: seciliYil, ay: seciliAy } = ayiCoz(tumZamanlarMi ? "" : secili);
  const [gosterilenYil, setGosterilenYil] = useState(seciliYil);
  const ref = useRef<HTMLDivElement>(null);

  // Popover her açıldığında seçili yıla döner — önceki açılıştan kalan yıl,
  // seçimin üzerinde olmayan bir tabloyu göstermek olurdu.
  useEffect(() => {
    if (open) setGosterilenYil(seciliYil);
  }, [open, seciliYil]);

  useEffect(() => {
    function disaTikla(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function kacTusu(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", disaTikla);
    document.addEventListener("keydown", kacTusu);
    return () => {
      document.removeEventListener("mousedown", disaTikla);
      document.removeEventListener("keydown", kacTusu);
    };
  }, []);

  function guncelle(deger: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ay", deger);
    params.delete("sayfa");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  const etiket = tumZamanlarMi ? "Tüm zamanlar" : `${AY_ADLARI[seciliAy - 1]} ${seciliYil}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Aya göre filtrele"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 items-center gap-2 rounded-full border px-3.5 font-body text-sm transition-colors cursor-pointer ${
          tumZamanlarMi
            ? "border-cizgi text-metin/70 hover:bg-zemin"
            : "border-vurgu/30 bg-vurgu/10 text-vurgu-dark"
        }`}
      >
        <TakvimIkonu className="size-4" />
        <span className="whitespace-nowrap">{etiket}</span>
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-cizgi bg-kart p-3 shadow-organik-hover"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label={String(gosterilenYil - 1)}
              onClick={() => setGosterilenYil((y) => y - 1)}
              className="rounded-lg px-2 py-1 text-metin/50 hover:bg-zemin hover:text-metin cursor-pointer"
            >
              ‹
            </button>
            <span className="font-mono text-sm font-semibold text-metin">{gosterilenYil}</span>
            <button
              type="button"
              aria-label={String(gosterilenYil + 1)}
              onClick={() => setGosterilenYil((y) => y + 1)}
              className="rounded-lg px-2 py-1 text-metin/50 hover:bg-zemin hover:text-metin cursor-pointer"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {AY_ADLARI.map((ad, i) => {
              const ayNo = i + 1;
              const buSecili = !tumZamanlarMi && gosterilenYil === seciliYil && ayNo === seciliAy;
              return (
                <button
                  key={ad}
                  type="button"
                  onClick={() => guncelle(`${gosterilenYil}-${pad(ayNo)}`)}
                  className={`rounded-lg px-1 py-1.5 font-body text-xs font-medium transition-colors cursor-pointer ${
                    buSecili ? "bg-vurgu text-white" : "text-metin/70 hover:bg-zemin"
                  }`}
                >
                  {ad.slice(0, 3)}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-cizgi flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                const simdi = new Date();
                guncelle(`${simdi.getFullYear()}-${pad(simdi.getMonth() + 1)}`);
              }}
              className="w-full rounded-lg px-2 py-1.5 font-body text-xs font-medium text-vurgu-dark hover:bg-vurgu/10 cursor-pointer"
            >
              Bu ay
            </button>
            <button
              type="button"
              onClick={() => guncelle(TUM_ZAMANLAR)}
              className={`w-full rounded-lg px-2 py-1.5 font-body text-xs font-medium cursor-pointer ${
                tumZamanlarMi ? "text-metin bg-zemin" : "text-metin/60 hover:bg-zemin"
              }`}
            >
              Tüm zamanlar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
