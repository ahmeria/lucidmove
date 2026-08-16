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
  return {
    url: localeUrl(pathname, routing.defaultLocale),
    changeFrequency: sıklık,
    priority: oncelik,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const kurslar = await db.course.findMany({
    where: { lessons: { some: {} } },
    select: { slug: true, lessons: { where: { ucretsizMi: true }, select: { slug: true } } },
  });

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

  return [...sabitSayfalar, ...kursSayfalari, ...dersSayfalari];
}
