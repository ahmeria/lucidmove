import { z } from "zod";

// Video alanları ya YouTube/Vimeo linki (http/https) ya da yerel yükleme yolu
// (/uploads/videos/...) olabilir — z.string().url() ikincisini reddeder.
export const videoUrlSemasi = z
  .string()
  .min(1)
  .refine((v) => v.startsWith("/uploads/") || /^https?:\/\//.test(v), {
    message: "Geçerli bir video URL'i ya da yüklenmiş dosya olmalı",
  });

export const videoUrlSemasiOpsiyonel = z
  .string()
  .refine((v) => v === "" || v.startsWith("/uploads/") || /^https?:\/\//.test(v), {
    message: "Geçerli bir video URL'i ya da yüklenmiş dosya olmalı",
  })
  .optional()
  .or(z.literal(""));

// Adres çubuğundan yapıştırılan "youtube.com/watch?v=..." gibi şemasız
// metinleri de kabul edebilmek için https:// eklenir; ayrıştırılamıyorsa null.
function urlCoz(girdi: string): URL | null {
  const ham = girdi.trim();
  if (!ham || ham.startsWith("/")) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(ham) ? ham : `https://${ham}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u : null;
  } catch {
    return null;
  }
}

const YOUTUBE_HOSTLARI = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function youtubeVideoId(url: string): string | null {
  const u = urlCoz(url);
  if (!u) return null;
  const host = u.hostname.toLowerCase();

  let id: string | null = null;
  if (host === "youtu.be") {
    id = u.pathname.split("/")[1] ?? null;
  } else if (YOUTUBE_HOSTLARI.has(host)) {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else id = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1] ?? null;
  }
  return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

export function isYoutubeUrl(url: string): boolean {
  return youtubeVideoId(url) !== null;
}

// enablejsapi=1 yalnızca "izlendi" takibi gerektiğinde eklenir (bkz.
// components/VideoPlayer.tsx) — YouTube'un iframe API'si yalnızca bu parametreyle
// olay (ör. video bitti) yayınlar.
export function youtubeEmbedUrl(url: string, jsApi = false): string | null {
  const id = youtubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}${jsApi ? "?enablejsapi=1" : ""}`;
}

export interface VimeoBilgisi {
  id: string;
  // Liste dışı (unlisted) videolar için gizli anahtar — vimeo.com/ID/HASH veya ?h=HASH.
  hash: string | null;
}

const VIMEO_HOSTLARI = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

function sayiMi(s: string | undefined): s is string {
  return !!s && /^\d+$/.test(s);
}

export function vimeoBilgisi(url: string): VimeoBilgisi | null {
  const u = urlCoz(url);
  if (!u || !VIMEO_HOSTLARI.has(u.hostname.toLowerCase())) return null;

  const seg = u.pathname.split("/").filter(Boolean);
  let idIndeksi = -1;
  if (u.hostname.toLowerCase() === "player.vimeo.com") {
    if (seg[0] === "video" && sayiMi(seg[1])) idIndeksi = 1;
  } else if (sayiMi(seg[0])) {
    idIndeksi = 0; // vimeo.com/123456789 veya vimeo.com/123456789/HASH
  } else if (seg[0] === "channels" && sayiMi(seg[2])) {
    idIndeksi = 2; // vimeo.com/channels/kanal/123456789
  } else if (seg[0] === "groups" && seg[2] === "videos" && sayiMi(seg[3])) {
    idIndeksi = 3; // vimeo.com/groups/grup/videos/123456789
  } else if ((seg[0] === "showcase" || seg[0] === "album") && seg[2] === "video" && sayiMi(seg[3])) {
    idIndeksi = 3; // vimeo.com/showcase/123/video/456789
  }
  if (idIndeksi < 0) return null;

  const adayHash = seg[idIndeksi + 1] ?? u.searchParams.get("h");
  const hash = adayHash && /^[a-zA-Z0-9]{6,32}$/.test(adayHash) && !sayiMi(adayHash) ? adayHash : null;
  return { id: seg[idIndeksi], hash };
}

export function isVimeoUrl(url: string): boolean {
  return vimeoBilgisi(url) !== null;
}

export function vimeoEmbedUrl(url: string): string | null {
  const bilgi = vimeoBilgisi(url);
  if (!bilgi) return null;
  // dnt=1: Vimeo'nun oynatma sırasında izleme çerezleri bırakmasını kapatır.
  return `https://player.vimeo.com/video/${bilgi.id}?${bilgi.hash ? `h=${bilgi.hash}&` : ""}dnt=1`;
}

// YouTube veya Vimeo bağlantısı mı (gömülü oynatıcıyla gösterilenler).
export function isEmbedVideoUrl(url: string): boolean {
  return isYoutubeUrl(url) || isVimeoUrl(url);
}

// Aynı videonun farklı yazımlarını (ek parametreler, m. alt alanı, kısa link…)
// tek bir kanonik biçime indirger — veritabanında hep aynı şekil saklansın diye.
export function videoUrlNormalizeEt(url: string): string {
  const yt = youtubeVideoId(url);
  if (yt) return `https://www.youtube.com/watch?v=${yt}`;
  const vimeo = vimeoBilgisi(url);
  if (vimeo) return `https://vimeo.com/${vimeo.id}${vimeo.hash ? `/${vimeo.hash}` : ""}`;
  return url;
}

// Ders (lesson) ve özel ders videoları: sunucuya yüklenmiş bir dosya YA DA bir
// YouTube/Vimeo bağlantısı. Rastgele bir dış URL kabul edilmez — bu alanlar
// yalnızca tanıdığımız iki oynatıcıyla ya da kendi <video> etiketimizle
// gösterilebiliyor. Bağlantılarda izlenme takibi (video bitti) oynatıcıların
// kendi JS API'leriyle yapılıyor, bkz. components/VideoPlayer.tsx.
export const dersVideoSemasi = z
  .string()
  .min(1)
  .refine((v) => v.startsWith("/uploads/") || isEmbedVideoUrl(v), {
    message: "Ders videosu için yüklenmiş bir dosya ya da geçerli bir YouTube/Vimeo bağlantısı girin",
  })
  .transform(videoUrlNormalizeEt);

// Yerel yüklenen dosya mı (mutlak URL değil, /uploads/... ile başlıyor)?
export function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/");
}
