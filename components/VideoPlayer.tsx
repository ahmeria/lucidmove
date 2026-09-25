"use client";

import { useEffect, useRef } from "react";
import { youtubeEmbedUrl, isYoutubeUrl, vimeoEmbedUrl, isVimeoUrl } from "@/lib/video";

// dersId verilirse (yalnızca ders sayfasından, tanıtım videosundan değil)
// video sonuna gelindiğinde izlenme kaydı (LessonProgress) sunucuya bildirilir
// — bkz. app/api/membership/watch. Yerel <video> için "ended" DOM olayı yeterli;
// YouTube ve Vimeo gömülü oynatıcılarında (iframe) bu olay DOM'a düşmediği için
// oynatıcıların kendi JS API'leri (IFrame API / player.js) yüklenip "bitti"
// olayı onlardan dinleniyor.
function izlendiBildir(dersId: string) {
  fetch("/api/membership/watch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dersId }),
    keepalive: true,
  }).catch(() => {
    // Sessizce yut — izlenme kaydı başarısız olsa da kullanıcının izleme
    // deneyimini bozmamalı.
  });
}

interface YoutubeApi {
  Player: new (
    eleman: HTMLIFrameElement,
    ayarlar: { events: { onStateChange: (olay: { data: number }) => void } }
  ) => unknown;
  PlayerState: { ENDED: number };
}
interface VimeoOyuncu {
  on(olay: string, geriCagri: () => void): void;
  off(olay: string, geriCagri?: () => void): void;
}
interface VimeoApi {
  Player: new (eleman: HTMLIFrameElement) => VimeoOyuncu;
}
declare global {
  interface Window {
    YT?: YoutubeApi;
    onYouTubeIframeAPIReady?: () => void;
    Vimeo?: VimeoApi;
  }
}

let youtubeApiSozu: Promise<YoutubeApi> | null = null;
function youtubeApiYukle(): Promise<YoutubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeApiSozu) {
    youtubeApiSozu = new Promise<YoutubeApi>((resolve, reject) => {
      const onceki = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        onceki?.();
        if (window.YT) resolve(window.YT);
      };
      const betik = document.createElement("script");
      betik.src = "https://www.youtube.com/iframe_api";
      betik.async = true;
      betik.onerror = () => {
        youtubeApiSozu = null;
        reject(new Error("YouTube API yüklenemedi"));
      };
      document.head.appendChild(betik);
    });
  }
  return youtubeApiSozu;
}

let vimeoApiSozu: Promise<VimeoApi> | null = null;
function vimeoApiYukle(): Promise<VimeoApi> {
  if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo);
  if (!vimeoApiSozu) {
    vimeoApiSozu = new Promise<VimeoApi>((resolve, reject) => {
      const betik = document.createElement("script");
      betik.src = "https://player.vimeo.com/api/player.js";
      betik.async = true;
      betik.onload = () => (window.Vimeo ? resolve(window.Vimeo) : reject(new Error("Vimeo API yüklenemedi")));
      betik.onerror = () => {
        vimeoApiSozu = null;
        reject(new Error("Vimeo API yüklenemedi"));
      };
      document.head.appendChild(betik);
    });
  }
  return vimeoApiSozu;
}

function YoutubeOynatici({ url, dersId }: { url: string; dersId?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!dersId) return;
    let iptal = false;
    youtubeApiYukle()
      .then((YT) => {
        if (iptal || !iframeRef.current) return;
        new YT.Player(iframeRef.current, {
          events: {
            onStateChange: (olay) => {
              if (!iptal && olay.data === YT.PlayerState.ENDED) izlendiBildir(dersId);
            },
          },
        });
      })
      .catch(() => {
        // API yüklenemedi (ör. reklam engelleyici) — video yine oynar, sadece
        // izlenme kaydı düşmez.
      });
    return () => {
      iptal = true;
    };
  }, [dersId]);

  return (
    <iframe
      ref={iframeRef}
      src={youtubeEmbedUrl(url, !!dersId) ?? undefined}
      title="Video"
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

function VimeoOynatici({ url, dersId }: { url: string; dersId?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!dersId) return;
    let iptal = false;
    let oyuncu: VimeoOyuncu | null = null;
    const bitti = () => izlendiBildir(dersId);
    vimeoApiYukle()
      .then((Vimeo) => {
        if (iptal || !iframeRef.current) return;
        oyuncu = new Vimeo.Player(iframeRef.current);
        oyuncu.on("ended", bitti);
      })
      .catch(() => {
        // API yüklenemedi — video yine oynar, sadece izlenme kaydı düşmez.
      });
    return () => {
      iptal = true;
      oyuncu?.off("ended", bitti);
    };
  }, [dersId]);

  return (
    <iframe
      ref={iframeRef}
      src={vimeoEmbedUrl(url) ?? undefined}
      title="Video"
      className="w-full h-full"
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
      allowFullScreen
    />
  );
}

export default function VideoPlayer({
  url,
  poster,
  dersId,
}: {
  url: string;
  poster?: string | null;
  dersId?: string;
}) {
  if (isYoutubeUrl(url)) return <YoutubeOynatici url={url} dersId={dersId} />;
  if (isVimeoUrl(url)) return <VimeoOynatici url={url} dersId={dersId} />;

  return (
    <video
      controls
      className="w-full h-full"
      src={url}
      poster={poster || undefined}
      onEnded={dersId ? () => izlendiBildir(dersId) : undefined}
    />
  );
}
