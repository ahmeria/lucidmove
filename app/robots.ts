import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Next.js Metadata Route — otomatik olarak /robots.txt olarak sunulur. /admin
// ve /api tamamen dışlanıyor (admin ayrıca kendi noindex meta'sını da
// taşıyor, bkz. app/admin/layout.tsx — burası crawl bütçesini de korumak
// için ikinci bir katman); /uploads (ders videosu/görsel dosyaları) arama
// sonuçlarında görünmesinin bir değeri olmadığı için dışlandı.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/uploads"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
