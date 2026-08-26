import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";
import { localeUrl } from "@/lib/seo";

// Next.js Metadata Route — otomatik olarak /sitemap.xml olarak sunulur.
// Locale'den bağımsız her yol için üç dilin de URL'ini + hreflang
// alternates'ini tek girdide veriyoruz (Next 14.2+ sitemap'lerin
// "alternates.languages" alanını destekliyor). Üyelik gerektiren (ücretsiz
// olmayan) ders sayfaları BİLEREK dışarıda bırakıldı — anonim ziyaretçi o
// URL'e gidince zaten kurs sayfasına yönlendiriliyor (bkz.
// courses/[slug]/[lessonSlug]/page.tsx), indexlenecek bir hedef değil.
function girdi(pathname: string, oncelik: number, sıklık: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localeUrl(pathname, l);
  // lib/seo.ts > localeAlternates (sayfaların kendi <head> hreflang'ı) x-default
  // ekliyor, burası eklemiyordu — sitemap'in dil hedefleme sinyali sayfanın
  // kendi meta verisiyle tutarsız kalıyordu.
  languages["x-default"] = localeUrl(pathname, routing.defaultLocale);
  return {
    url: localeUrl(pathname, routing.defaultLocale),
    changeFrequency: sıklık,
    priority: oncelik,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [kurslar, kamplar, ozelDersler] = await Promise.all([
    db.course.findMany({
      where: { lessons: { some: {} } },
      select: { slug: true, lessons: { where: { ucretsizMi: true }, select: { slug: true } } },
    }),
    // Süresi geçmiş (bitisTarihi < now) kamplar sitemap'ten bilerek dışarıda —
    // sayfaları yayında kalsa da (bkz. camps/[slug]/page.tsx) artık aranabilir
    // birer hedef değiller.
    db.camp.findMany({ where: { yayindaMi: true, bitisTarihi: { gte: new Date() } }, select: { slug: true } }),
    // Özel ders video izleme sayfaları BİLEREK dışarıda — hiçbir video asla
    // ücretsiz değil (kurslardaki ücretsiz-olmayan derslerle aynı gerekçe).
    db.privateLesson.findMany({ where: { yayindaMi: true }, select: { slug: true } }),
  ]);

  const sabitSayfalar: MetadataRoute.Sitemap = [
    girdi("/", 1, "weekly"),
    girdi("/courses", 0.9, "weekly"),
    girdi("/contact", 0.4, "yearly"),
    girdi("/terms", 0.2, "yearly"),
    girdi("/privacy", 0.2, "yearly"),
  ];

  const kursSayfalari: MetadataRoute.Sitemap = kurslar.map((k) => girdi(`/courses/${k.slug}`, 0.8, "monthly"));

  const dersSayfalari: MetadataRoute.Sitemap = kurslar.flatMap((k) =>
    k.lessons.map((d) => girdi(`/courses/${k.slug}/${d.slug}`, 0.6, "monthly"))
  );

  const kampSayfalari: MetadataRoute.Sitemap = kamplar.map((k) => girdi(`/camps/${k.slug}`, 0.7, "weekly"));

  const ozelDersSayfalari: MetadataRoute.Sitemap = ozelDersler.map((d) =>
    girdi(`/private-lessons/${d.slug}`, 0.7, "monthly")
  );

  return [...sabitSayfalar, ...kursSayfalari, ...dersSayfalari, ...kampSayfalari, ...ozelDersSayfalari];
}
