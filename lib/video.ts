import { z } from "zod";

// Video alanları ya YouTube linki (http/https) ya da yerel yükleme yolu
// (/uploads/videos/...) olabilir — z.string().url() ikincisini reddeder.
export const videoUrlSemasi = z
  .string()
  .min(1)
  .refine((v) => v.startsWith("/uploads/") || /^https?:\/\//.test(v), {
    message: "Geçerli bir video URL'i ya da yüklenmiş dosya olmalı",
  });

// Ders (lesson) videoları artık yalnızca sunucuya yüklenen dosyalar olabilir —
// YouTube linki kabul edilmez (tüm ders içeriği sunucuda barındırılıp
// filigranlanmalı). Kurs tanıtım videosu için videoUrlSemasiOpsiyonel kalır.
export const dersVideoYoluSemasi = z
  .string()
  .min(1)
  .refine((v) => v.startsWith("/uploads/"), {
    message: "Ders videosu için sunucuya yüklenmiş bir dosya seçin (YouTube linki kabul edilmez)",
  });

export const videoUrlSemasiOpsiyonel = z
  .string()
  .refine((v) => v === "" || v.startsWith("/uploads/") || /^https?:\/\//.test(v), {
    message: "Geçerli bir video URL'i ya da yüklenmiş dosya olmalı",
  })
  .optional()
  .or(z.literal(""));

const YOUTUBE_DESENLERI = [
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

export function youtubeVideoId(url: string): string | null {
  for (const desen of YOUTUBE_DESENLERI) {
    const eslesme = url.match(desen);
    if (eslesme) return eslesme[1];
  }
  return null;
}

export function isYoutubeUrl(url: string): boolean {
  return youtubeVideoId(url) !== null;
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

// Yerel yüklenen dosya mı (mutlak URL değil, /uploads/... ile başlıyor)?
export function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/");
}
