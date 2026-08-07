import { z } from "zod";

// Görsel alanları ya dış URL (http/https) ya da yerel yükleme yolu
// (/uploads/images/...) olabilir — z.string().url() ikincisini reddeder
// (bkz. lib/video.ts > videoUrlSemasiOpsiyonel, aynı desenin görsel karşılığı).
export const gorselUrlSemasiOpsiyonel = z
  .string()
  .refine((v) => v === "" || v.startsWith("/uploads/") || /^https?:\/\//.test(v), {
    message: "Geçerli bir görsel URL'i ya da yüklenmiş dosya olmalı",
  })
  .optional()
  .or(z.literal(""));
