"use client";

import { useState, ChangeEvent } from "react";
import { dosyaYukleParcali } from "@/lib/istemciDosyaYukleme";

const alan = "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";

const MAKSIMUM_VIDEO_BOYUTU = 2 * 1024 * 1024 * 1024; // 2 GB — bkz. lib/parcaliYukleme.ts

export default function VideoInput({
  value,
  onChange,
  zorunlu,
  sadeceYukleme,
}: {
  value: string;
  onChange: (v: string) => void;
  zorunlu?: boolean;
  // Ders videoları artık yalnızca sunucuya yüklenebilir — YouTube sekmesi gizlenir.
  sadeceYukleme?: boolean;
}) {
  const [sekme, setSekme] = useState<"youtube" | "yukle">(
    sadeceYukleme || value.startsWith("/uploads/") ? "yukle" : "youtube"
  );
  const [yukleniyor, setYukleniyor] = useState(false);
  const [yuzde, setYuzde] = useState(0);
  const [hata, setHata] = useState("");

  async function dosyaSecildi(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    if (dosya.size > MAKSIMUM_VIDEO_BOYUTU) {
      setHata("Dosya çok büyük — en fazla 2 GB");
      e.target.value = "";
      return;
    }

    setYukleniyor(true);
    setYuzde(0);
    setHata("");

    try {
      const veri = await dosyaYukleParcali(dosya, setYuzde);
      onChange(veri.url);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div>
      {!sadeceYukleme && (
        <div className="flex items-center gap-3 mb-2 text-xs font-body">
          <button
            type="button"
            onClick={() => setSekme("youtube")}
            className={sekme === "youtube" ? "font-bold text-vurgu" : "text-metin/50 hover:text-metin"}
          >
            YouTube linki
          </button>
          <span className="text-metin/30">·</span>
          <button
            type="button"
            onClick={() => setSekme("yukle")}
            className={sekme === "yukle" ? "font-bold text-vurgu" : "text-metin/50 hover:text-metin"}
          >
            Dosya yükle
          </button>
        </div>
      )}

      {sekme === "youtube" ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required={zorunlu}
          className={alan}
        />
      ) : (
        <div>
          <input
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={dosyaSecildi}
            disabled={yukleniyor}
            className="font-body text-sm text-metin/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-metin file:text-zemin file:text-xs hover:file:bg-koyu file:cursor-pointer file:disabled:opacity-60"
          />
          {yukleniyor && (
            <div className="mt-2.5 max-w-xs">
              <div className="h-1.5 bg-cizgi rounded-full overflow-hidden">
                <div className="h-full bg-vurgu rounded-full transition-[width] duration-200" style={{ width: `${yuzde}%` }} />
              </div>
              <p className="text-xs text-metin/50 mt-1.5">Yükleniyor… %{yuzde} — büyük dosyalarda uzun sürebilir, sayfadan ayrılmayın</p>
            </div>
          )}
          {!yukleniyor && value && value.startsWith("/uploads/") && (
            <p className="text-xs text-vurgu-dark mt-1.5">Yüklendi: {value.split("/").pop()}</p>
          )}
        </div>
      )}

      {hata && <p className="text-xs text-red-700 mt-1.5">{hata}</p>}
    </div>
  );
}
