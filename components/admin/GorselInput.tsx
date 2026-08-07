"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { dosyaYukle } from "@/lib/istemciDosyaYukleme";

// Admin panelinde görsel (kurs kapağı vb.) eklemenin tek yolu — ham URL metin
// alanı yerine dosya seçip sunucuya yüklüyor, küçük bir önizleme + ilerleme
// çubuğu gösteriyor (bkz. VideoInput.tsx, aynı desenin görsel karşılığı).
export default function GorselInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [yuzde, setYuzde] = useState(0);
  const [hata, setHata] = useState("");

  async function dosyaSecildi(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    setYukleniyor(true);
    setYuzde(0);
    setHata("");

    try {
      const veri = await dosyaYukle(dosya, setYuzde);
      onChange(veri.url);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {value && (
        <div className="relative size-20 rounded-xl overflow-hidden border border-cizgi shrink-0 bg-zemin">
          <Image src={value} alt="" fill sizes="80px" className="object-cover" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={dosyaSecildi}
          disabled={yukleniyor}
          className="font-body text-sm text-metin/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-metin file:text-zemin file:text-xs hover:file:bg-koyu file:cursor-pointer file:disabled:opacity-60"
        />
        {yukleniyor && (
          <div className="mt-2.5 max-w-xs">
            <div className="h-1.5 bg-cizgi rounded-full overflow-hidden">
              <div className="h-full bg-vurgu rounded-full transition-[width] duration-200" style={{ width: `${yuzde}%` }} />
            </div>
            <p className="text-xs text-metin/50 mt-1.5">Yükleniyor… %{yuzde}</p>
          </div>
        )}
        {!yukleniyor && hata && <p className="text-xs text-red-700 mt-1.5">{hata}</p>}
      </div>
    </div>
  );
}
