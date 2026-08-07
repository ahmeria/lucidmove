"use client";

import { useState, ChangeEvent } from "react";

const alan = "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";

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
  const [hata, setHata] = useState("");

  async function dosyaSecildi(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    setYukleniyor(true);
    setHata("");

    const form = new FormData();
    form.append("dosya", dosya);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const veri = await res.json();
      if (!res.ok) {
        setHata(veri.hata || "Yükleme başarısız");
        return;
      }
      onChange(veri.url);
    } catch {
      setHata("Yükleme başarısız — bağlantınızı kontrol edin");
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
            className="font-body text-sm text-metin/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-metin file:text-zemin file:text-xs hover:file:bg-koyu file:cursor-pointer"
          />
          {yukleniyor && <p className="text-xs text-metin/50 mt-1.5">Yükleniyor…</p>}
          {!yukleniyor && value && value.startsWith("/uploads/") && (
            <p className="text-xs text-vurgu-dark mt-1.5">Yüklendi: {value.split("/").pop()}</p>
          )}
        </div>
      )}

      {hata && <p className="text-xs text-red-700 mt-1.5">{hata}</p>}
    </div>
  );
}
