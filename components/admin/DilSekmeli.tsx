"use client";

import { useState } from "react";

const DILLER = [
  { kod: "tr", etiket: "TR" },
  { kod: "en", etiket: "EN" },
  { kod: "az", etiket: "AZ" },
] as const;

type DilKodu = (typeof DILLER)[number]["kod"];

// Bir metin alanının TR (zorunlu) + EN + AZ (opsiyonel) varyantlarını tek bir
// input/textarea üstünde küçük bir sekme şeridiyle değiştirerek gösterir —
// alan başına ayrı 3 input yerine, form 3 katına çıkmasın diye. TR her zaman
// zorunlu; EN/AZ boş bırakılırsa frontend otomatik Türkçe'ye düşer (bkz.
// lib/i18nIcerik.ts). Henüz çevrilmemiş EN/AZ sekmesinde küçük bir uyarı
// noktası görünür. Admin arayüzünün geri kalanı gibi bu bileşen de Türkçe —
// yalnızca YÖNETTİĞİ İÇERİK çok dilli.
export default function DilSekmeli({
  etiket,
  tr,
  en,
  az,
  onTrChange,
  onEnChange,
  onAzChange,
  textarea = false,
  rows = 3,
  yardimciMetin,
}: {
  etiket: string;
  tr: string;
  en: string;
  az: string;
  onTrChange: (deger: string) => void;
  onEnChange: (deger: string) => void;
  onAzChange: (deger: string) => void;
  textarea?: boolean;
  rows?: number;
  yardimciMetin?: string;
}) {
  const [aktifDil, setAktifDil] = useState<DilKodu>("tr");

  const degerler: Record<DilKodu, string> = { tr, en, az };
  const degistiriciler: Record<DilKodu, (deger: string) => void> = {
    tr: onTrChange,
    en: onEnChange,
    az: onAzChange,
  };
  const doluMu: Record<DilKodu, boolean> = { tr: !!tr, en: !!en, az: !!az };

  const alanSinifi =
    "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <label className="text-sm text-metin/70">{etiket}</label>
        <div className="flex items-center gap-1 shrink-0">
          {DILLER.map((d) => (
            <button
              key={d.kod}
              type="button"
              onClick={() => setAktifDil(d.kod)}
              className={`relative px-2 py-0.5 rounded-md font-mono text-[10px] uppercase tracking-wide transition-colors cursor-pointer ${
                aktifDil === d.kod ? "bg-vurgu text-white" : "text-metin/45 hover:bg-zemin hover:text-metin"
              }`}
            >
              {d.etiket}
              {d.kod !== "tr" && !doluMu[d.kod] && (
                <span
                  className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-amber-500"
                  title="Henüz çevrilmedi"
                />
              )}
            </button>
          ))}
        </div>
      </div>
      {textarea ? (
        <textarea
          value={degerler[aktifDil]}
          onChange={(e) => degistiriciler[aktifDil](e.target.value)}
          rows={rows}
          placeholder={aktifDil !== "tr" ? tr : undefined}
          className={`${alanSinifi} resize-none`}
        />
      ) : (
        <input
          value={degerler[aktifDil]}
          onChange={(e) => degistiriciler[aktifDil](e.target.value)}
          placeholder={aktifDil !== "tr" ? tr : undefined}
          className={alanSinifi}
        />
      )}
      {yardimciMetin && <p className="text-xs text-metin/45 mt-1.5">{yardimciMetin}</p>}
    </div>
  );
}
