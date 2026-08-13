"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { dosyaYukle } from "@/lib/istemciDosyaYukleme";
import GorselKirpici from "@/components/GorselKirpici";

// Admin panelinde görsel (kurs kapağı vb.) eklemenin tek yolu — ham URL metin
// alanı yerine dosya seçip sunucuya yüklüyor, küçük bir önizleme + ilerleme
// çubuğu gösteriyor (bkz. VideoInput.tsx, aynı desenin görsel karşılığı).
// Dosya seçilince önce GorselKirpici modalı açılır — sunucuya her zaman zaten
// `oran`a göre kırpılmış bir görsel gider.
export default function GorselInput({
  value,
  onChange,
  oran = 1,
  daire,
}: {
  value: string;
  onChange: (v: string) => void;
  oran?: number;
  daire?: boolean;
}) {
  const [seciliDosya, setSeciliDosya] = useState<File | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [yuzde, setYuzde] = useState(0);
  const [hata, setHata] = useState("");

  function dosyaSecildi(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = ""; // aynı dosya art arda seçilebilsin diye
    if (!dosya) return;
    setHata("");
    setSeciliDosya(dosya);
  }

  async function kirpmaTamamlandi(kirpilmisDosya: File) {
    setSeciliDosya(null);
    setYukleniyor(true);
    setYuzde(0);

    try {
      const veri = await dosyaYukle(kirpilmisDosya, setYuzde);
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

      {seciliDosya && (
        <GorselKirpici
          dosya={seciliDosya}
          oran={oran}
          daire={daire}
          onTamam={kirpmaTamamlandi}
          onIptal={() => setSeciliDosya(null)}
        />
      )}
    </div>
  );
}
