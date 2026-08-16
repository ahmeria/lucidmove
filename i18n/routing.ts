import { defineRouting } from "next-intl/routing";

// Site 3 dilde: Türkçe (varsayılan, URL'de önek YOK — lucidmove.net/kurslar
// değil zaten İngilizce route'lar kullanılıyor, ör. lucidmove.net/courses),
// İngilizce ve Azerbaycan dili (ikisi de önekli — /en/courses, /az/courses).
// Admin panel (app/admin/**) bu routing'in tamamen DIŞINDA — hiçbir zaman
// locale öneki almıyor, her zaman Türkçe.
export const routing = defineRouting({
  locales: ["tr", "en", "az"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
