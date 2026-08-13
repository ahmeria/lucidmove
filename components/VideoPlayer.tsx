"use client";

import { youtubeEmbedUrl, isYoutubeUrl } from "@/lib/video";

// dersId verilirse (yalnızca ders sayfasından, tanıtım videosundan değil) ve
// video yerel bir dosyaysa, video sonuna gelindiğinde izlenme kaydı
// (LessonProgress) sunucuya bildirilir — bkz. app/api/membership/watch.
// YouTube gömülü oynatıcıda (iframe) "bitti" olayını DOM'dan yakalamak
// mümkün değil (postMessage entegrasyonu gerekir); ders videoları zaten
// yalnızca yerel yükleme kabul ediyor (bkz. VideoInput.tsx > sadeceYukleme),
// bu yüzden bu eksiklik pratikte hiç devreye girmiyor.
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

export default function VideoPlayer({
  url,
  poster,
  dersId,
}: {
  url: string;
  poster?: string | null;
  dersId?: string;
}) {
  if (isYoutubeUrl(url)) {
    const embedUrl = youtubeEmbedUrl(url);
    return (
      <iframe
        src={embedUrl ?? undefined}
        title="Video"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

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
