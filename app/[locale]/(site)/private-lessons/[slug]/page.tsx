import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ozelDersSatinAlindiMi } from "@/lib/ozelDersler";
import { getSiteSettings, formatFiyat, markaAdi } from "@/lib/settings";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import { SITE_URL, localeUrl, localeAlternates, ogLocale, mutlakGorselUrl } from "@/lib/seo";
import { jsonLdGuvenli } from "@/lib/jsonLd";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import OzelDersAksiyonlari from "./OzelDersAksiyonlari";
import OzelDersVideoKarti from "./OzelDersVideoKarti";

export const dynamic = "force-dynamic";

// generateMetadata + sayfanın kendisi aynı özel dersi ayrı ayrı sorgulamasın
// diye (bkz. courses/[slug]/page.tsx'teki aynı gerekçe) React cache().
const dersiGetir = cache((slug: string) =>
  db.privateLesson.findUnique({ where: { slug }, include: { videos: { orderBy: { sira: "asc" } } } })
);

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const locale = params.locale as AppLocale;
  const [ders, ayarlar] = await Promise.all([dersiGetir(params.slug), getSiteSettings()]);
  // Yayında olmayan bir özel ders için de sayfa gövdesi notFound() dönüyor
  // (bkz. aşağıdaki bileşen) — ama generateMetadata AYRI bir çağrı, o
  // kontrolü paylaşmıyor. Burada kontrol edilmezse taslak bir dersin başlığı/
  // açıklaması, sayfa 404 gösterse bile <head>'e (title/OG) sızardı.
  if (!ders || !ders.yayindaMi) return {};

  const marka = markaAdi(ayarlar, locale);
  const baslik = cevrilenAlan(ders.baslik, ders.baslikEn, ders.baslikAz, locale);
  const aciklama = cevrilenAlan(ders.aciklama, ders.aciklamaEn, ders.aciklamaAz, locale);
  const tamBaslik = `${baslik} — ${marka}`;
  const yol = `/private-lessons/${ders.slug}`;

  return {
    title: tamBaslik,
    description: aciklama,
    alternates: localeAlternates(yol, locale),
    openGraph: {
      title: tamBaslik,
      description: aciklama,
      url: localeUrl(yol, locale),
      images: ders.kapakUrl ? [{ url: ders.kapakUrl }] : undefined,
      locale: ogLocale(locale),
      type: "website",
    },
  };
}

export default async function OzelDersDetay({
  params,
  searchParams,
}: {
  params: { slug: string; locale: string };
  searchParams: { durum?: string };
}) {
  const locale = params.locale as AppLocale;
  const ders = await dersiGetir(params.slug);
  // Yayında olmayan bir özel ders herkes için (admin dahil) 404 — admin
  // önizlemeyi düzenleme ekranından yapar (bkz. Camp ile aynı desen).
  if (!ders || !ders.yayindaMi) notFound();

  const [ayarlar, t, session] = await Promise.all([
    getSiteSettings(),
    getTranslations("privateLessons"),
    getServerSession(authOptions),
  ]);
  const satinAlindiMi = await ozelDersSatinAlindiMi(session?.user?.id, ders.id);

  const baslik = cevrilenAlan(ders.baslik, ders.baslikEn, ders.baslikAz, locale);
  const aciklama = cevrilenAlan(ders.aciklama, ders.aciklamaEn, ders.aciklamaAz, locale);
  const fiyatMetni = formatFiyat(ders.fiyat.toNumber(), ayarlar, locale);
  const toplamDakika = ders.videos.reduce((t, v) => t + v.sureDakika, 0);

  const dersJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: baslik,
    description: aciklama,
    url: localeUrl(`/private-lessons/${ders.slug}`, locale),
    provider: { "@type": "Organization", name: markaAdi(ayarlar, locale), url: SITE_URL },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
    ...(mutlakGorselUrl(ders.kapakUrl) ? { image: mutlakGorselUrl(ders.kapakUrl) } : {}),
    offers: {
      "@type": "Offer",
      price: ders.fiyat.toString(),
      priceCurrency: ayarlar.paraBirimi,
      availability: "https://schema.org/InStock",
      url: localeUrl(`/private-lessons/${ders.slug}`, locale),
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGuvenli(dersJsonLd) }} />
      {/* HERO — kurs detay sayfasıyla aynı iki-sütun yerleşim (bkz.
          courses/[slug]/page.tsx). Üyelik yönlendirmesi YOK — özel ders,
          üyelik durumundan bağımsız satın alınabilir. */}
      <section className="container-nefes pt-14 sm:pt-20 pb-20">
        <Link
          href="/#private-lessons"
          className="font-mono text-xs text-metin/50 hover:text-metin transition-colors inline-flex items-center gap-1.5 mb-8"
        >
          ← {t("geriDon")}
        </Link>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-toprak-dark">{t("etiket")}</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-metin mt-3 leading-tight">{baslik}</h1>
            <p className="font-body text-metin/70 mt-5 leading-relaxed">{aciklama}</p>

            <div className="flex items-center gap-4 mt-6 font-mono text-xs text-metin/50 uppercase tracking-wide">
              <span>{t("videoSayisi", { count: ders.videos.length })}</span>
              <span className="size-1 rounded-full bg-metin/25" />
              <span>{t("toplamDakika", { count: toplamDakika })}</span>
            </div>

            <p className="font-display text-2xl font-bold text-metin mt-6">{fiyatMetni}</p>

            <OzelDersAksiyonlari
              slug={ders.slug}
              ilkVideoSlug={ders.videos[0]?.slug ?? null}
              satinAlindiMi={satinAlindiMi}
              baslangicDurum={searchParams.durum}
            />
          </div>

          <div className="relative aspect-[4/3] foto-organik overflow-hidden shadow-organik-hover bg-koyu">
            {ders.tanitimVideoUrl ? (
              <VideoPlayer url={ders.tanitimVideoUrl} poster={ders.kapakUrl} />
            ) : ders.kapakUrl ? (
              <Image
                src={ders.kapakUrl}
                alt={baslik}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* VİDEOLAR — satın alınmamışsa her biri kilitli görünür. */}
      <section className="container-nefes pb-24">
        <h2 className="font-display text-2xl font-bold text-metin mb-8">{t("videolar")}</h2>

        {ders.videos.length === 0 ? (
          <p className="font-body text-metin/60">{t("henuzVideoYok")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {ders.videos.map((video) => (
              <OzelDersVideoKarti
                key={video.id}
                video={{
                  id: video.id,
                  slug: video.slug,
                  baslik: cevrilenAlan(video.baslik, video.baslikEn, video.baslikAz, locale),
                  kapakUrl: video.kapakUrl,
                  sureDakika: video.sureDakika,
                }}
                dersSlug={ders.slug}
                satinAlindiMi={satinAlindiMi}
                dkEtiketi={t("dk")}
                satinAlEtiketi={t("satinAl")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
