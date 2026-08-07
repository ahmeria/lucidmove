"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { dosyaYukle } from "@/lib/istemciDosyaYukleme";
import { useToast } from "@/components/Toast";

// Yüklenmiş bir videonun içinden (tamamen tarayıcıda, video+canvas ile) bir
// kare yakalayıp bunu kapak görseli olarak sunucuya yükler — ayrıca dosya
// seçmeye gerek kalmadan. Yalnızca sunucuya yüklenmiş yerel videolar için
// çalışır (aynı origin olmalı, aksi halde canvas "tainted" olur).
export default function VideoKareSecici({
  videoUrl,
  onSecildi,
}: {
  videoUrl: string;
  onSecildi: (url: string) => void;
}) {
  const [acik, setAcik] = useState(false);
  const [sure, setSure] = useState(0);
  const [zaman, setZaman] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast();

  function metaVeriYuklendi() {
    const v = videoRef.current;
    if (!v) return;
    setSure(v.duration);
    // Tam baştan değil ortadan başlıyoruz — ilk kare genelde siyah/boş olur.
    const baslangic = v.duration / 2;
    setZaman(baslangic);
    v.currentTime = baslangic;
  }

  function zamanDegisti(e: ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    setZaman(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  }

  function kareyeGecmesiniBekle(): Promise<void> {
    const v = videoRef.current;
    if (!v || !v.seeking) return Promise.resolve();
    return new Promise((resolve) => {
      const bitince = () => {
        v.removeEventListener("seeked", bitince);
        resolve();
      };
      v.addEventListener("seeked", bitince);
      setTimeout(resolve, 800); // güvenlik zaman aşımı
    });
  }

  async function kareyiKullan() {
    await kareyeGecmesiniBekle();

    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);

    setYukleniyor(true);
    c.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Kare yakalanamadı");
          setYukleniyor(false);
          return;
        }
        try {
          const dosya = new File([blob], "kapak.jpg", { type: "image/jpeg" });
          const veri = await dosyaYukle(dosya);
          onSecildi(veri.url);
          toast.success("Kapak görseli videodan seçildi.");
          setAcik(false);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Yükleme başarısız");
        } finally {
          setYukleniyor(false);
        }
      },
      "image/jpeg",
      0.9
    );
  }

  if (!acik) {
    return (
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="mt-2 font-body text-xs text-vurgu hover:text-vurgu-dark cursor-pointer"
      >
        Videodan kapak seç
      </button>
    );
  }

  return (
    <div className="mt-2 border border-cizgi rounded-lg p-3 bg-kart space-y-2.5">
      <video
        ref={videoRef}
        src={videoUrl}
        onLoadedMetadata={metaVeriYuklendi}
        className="w-full rounded-lg bg-koyu aspect-video object-contain"
        muted
        playsInline
      />
      <input
        type="range"
        min={0}
        max={sure || 0}
        step={0.1}
        value={zaman}
        onChange={zamanDegisti}
        aria-label="Video karesi seç"
        className="w-full accent-vurgu cursor-pointer"
      />
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setAcik(false)}
          className="font-body text-xs text-metin/50 hover:text-metin cursor-pointer"
        >
          Vazgeç
        </button>
        <button
          type="button"
          onClick={kareyiKullan}
          disabled={yukleniyor}
          className="bg-metin text-zemin px-3 py-1.5 rounded-lg text-xs font-body hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {yukleniyor ? "Yükleniyor…" : "Bu kareyi kullan"}
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
