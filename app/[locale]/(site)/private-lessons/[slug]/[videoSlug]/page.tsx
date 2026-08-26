import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ozelDersSatinAlindiMi } from "@/lib/ozelDersler";
import { getSiteSettings } from "@/lib/settings";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import { localeUrl, localeAlternates, ogLocale } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import VideoPlayer from "@/components/VideoPlayer";

export const dynamic = "force-dynamic";

// generateMetadata + sayfanın kendisi aynı özel dersi ayrı ayrı sorgulamasın
// diye (bkz. private-lessons/[slug]/page.tsx'teki aynı gerekçe) React cache().
const dersiGetir = cache((slug: string) =>
  db.privateLesson.findUnique({ where: { slug }, include: { videos: { orderBy: { sira: "asc" } } } })
);

export async function generateMetadata({
  params,
}: {
  params: { slug: string; videoSlug: string; locale: string };
}): Promise<Metadata> {
  const locale = params.locale as AppLocale;
  const [ders, ayarlar] = await Promise.all([dersiGetir(params.slug), getSiteSettings()]);
  const video = ders?.videos.find((v) => v.slug === params.videoSlug);
  // bkz. private-lessons/[slug]/page.tsx'teki aynı gerekçe — yayında olmayan
  // bir dersin video meta verisi de generateMetadata üzerinden sızmasın.
  if (!ders || !ders.yayindaMi || !video) return {};

  const marka = ayarlar.siteBasligi.split("—")[0].trim() || "LucidMove";
  const dersBaslik = cevrilenAlan(ders.baslik, ders.baslikEn, ders.baslikAz, locale);
  const videoBaslik = cevrilenAlan(video.baslik, video.baslikEn, video.baslikAz, locale);
  const videoAciklama = video.aciklama
    ? cevrilenAlan(video.aciklama, video.aciklamaEn, video.aciklamaAz, locale)
    : cevrilenAlan(ders.aciklama, ders.aciklamaEn, ders.aciklamaAz, locale);
  const baslik = `${videoBaslik} — ${dersBaslik} — ${marka}`;
  const yol = `/private-lessons/${ders.slug}/${video.slug}`;

  return {
    title: baslik,
    description: videoAciklama,
    // Satın alınmadan izlenemeyen içerik — sonuç sayfalarında görünmesin.
    robots: { index: false, follow: true },
    alternates: localeAlternates(yol, locale),
    openGraph: {
      title: baslik,
      description: videoAciklama,
      url: localeUrl(yol, locale),
      images: video.kapakUrl || ders.kapakUrl ? [{ url: (video.kapakUrl || ders.kapakUrl)! }] : undefined,
      locale: ogLocale(locale),
      type: "website",
    },
  };
}

export default async function OzelDersVideoDetay({
  params,
}: {
  params: { slug: string; videoSlug: string; locale: string };
}) {
  const locale = params.locale as AppLocale;
  const [ders, t] = await Promise.all([dersiGetir(params.slug), getTranslations("privateLessons")]);
  // Detay sayfasıyla (bkz. ../page.tsx) TUTARLI: yayında olmayan bir ders
  // herkes için (satın almış olsa bile) 404 — admin önizlemeyi düzenleme
  // ekranından yapar.
  if (!ders || !ders.yayindaMi) notFound();

  const video = ders.videos.find((v) => v.slug === params.videoSlug);
  if (!video) notFound();

  const session = await getServerSession(authOptions);
  const satinAlindiMi = await ozelDersSatinAlindiMi(session?.user?.id, ders.id);

  if (!satinAlindiMi) {
    redirect(getPathname({ href: `/private-lessons/${ders.slug}?durum=satin-alma-gerekli`, locale }));
  }

  const guncelIndex = ders.videos.findIndex((v) => v.slug === video.slug);
  const sonrakiVideo = ders.videos[guncelIndex + 1];
  const dersBaslik = cevrilenAlan(ders.baslik, ders.baslikEn, ders.baslikAz, locale);
  const videoBaslik = cevrilenAlan(video.baslik, video.baslikEn, video.baslikAz, locale);

  return (
    <div className="container-nefes py-16 max-w-3xl">
      <Link href={`/private-lessons/${ders.slug}`} className="font-body text-sm text-metin/60 hover:text-metin">
        ← {dersBaslik}
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-metin mt-4">{videoBaslik}</h1>
      <p className="font-mono text-xs text-metin/45 mt-2">
        {video.sureDakika} {t("dk")}
      </p>

      <div className="mt-8 aspect-video bg-koyu rounded-2xl overflow-hidden">
        {video.videoUrl ? (
          <VideoPlayer url={video.videoUrl} poster={video.kapakUrl ?? ders.kapakUrl} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center px-6">
            <p className="font-body text-sm text-zemin/70">{t("videoBulunamadi")}</p>
          </div>
        )}
      </div>

      {sonrakiVideo && (
        <div className="mt-8 flex justify-end">
          <Link
            href={`/private-lessons/${ders.slug}/${sonrakiVideo.slug}`}
            className="font-body text-sm text-metin bg-cizgi/60 hover:bg-cizgi px-5 py-2.5 rounded-full transition-colors"
          >
            {t("sonrakiVideo")}: {cevrilenAlan(sonrakiVideo.baslik, sonrakiVideo.baslikEn, sonrakiVideo.baslikAz, locale)} →
          </Link>
        </div>
      )}
    </div>
  );
}
