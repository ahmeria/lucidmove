import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { aktifUyelikVarMi } from "@/lib/uyelik";
import { moodlariAl } from "@/lib/moods";
import { getSiteSettings } from "@/lib/settings";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import { localeUrl, localeAlternates, ogLocale } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import VideoPlayer from "@/components/VideoPlayer";

export const dynamic = "force-dynamic";

// generateMetadata + sayfanın kendisi aynı kursu ayrı ayrı sorgulamasın diye
// (bkz. courses/[slug]/page.tsx'teki aynı gerekçe) React cache().
const kursuGetir = cache((slug: string) =>
  db.course.findUnique({ where: { slug }, include: { lessons: { orderBy: { sira: "asc" } } } })
);

export async function generateMetadata({
  params,
}: {
  params: { slug: string; lessonSlug: string; locale: string };
}): Promise<Metadata> {
  const locale = params.locale as AppLocale;
  const [kurs, ayarlar] = await Promise.all([kursuGetir(params.slug), getSiteSettings()]);
  const ders = kurs?.lessons.find((d) => d.slug === params.lessonSlug);
  if (!kurs || !ders) return {};

  const marka = ayarlar.siteBasligi.split("—")[0].trim() || "LucidMove";
  const kursBaslik = cevrilenAlan(kurs.baslik, kurs.baslikEn, kurs.baslikAz, locale);
  const kursAciklama = cevrilenAlan(kurs.aciklama, kurs.aciklamaEn, kurs.aciklamaAz, locale);
  const dersBaslik = cevrilenAlan(ders.baslik, ders.baslikEn, ders.baslikAz, locale);
  // Derste kendine ait bir açıklama girilmemişse (demo verilerin çoğunda
  // olduğu gibi) kursun açıklamasına düşer — boş meta description'dan iyi.
  const dersAciklama = ders.aciklama
    ? cevrilenAlan(ders.aciklama, ders.aciklamaEn, ders.aciklamaAz, locale)
    : kursAciklama;
  const baslik = `${dersBaslik} — ${kursBaslik} — ${marka}`;
  const yol = `/courses/${kurs.slug}/${ders.slug}`;

  return {
    title: baslik,
    description: dersAciklama,
    alternates: localeAlternates(yol, locale),
    openGraph: {
      title: baslik,
      description: dersAciklama,
      url: localeUrl(yol, locale),
      images: ders.kapakUrl || kurs.kapakUrl ? [{ url: (ders.kapakUrl || kurs.kapakUrl)! }] : undefined,
      locale: ogLocale(locale),
      type: "website",
    },
  };
}

export default async function DersDetay({
  params,
}: {
  params: { slug: string; lessonSlug: string; locale: string };
}) {
  const locale = params.locale as AppLocale;
  const [kurs, moodlar, t] = await Promise.all([kursuGetir(params.slug), moodlariAl(), getTranslations("lessonDetail")]);
  if (!kurs) notFound();

  const ders = kurs.lessons.find((d) => d.slug === params.lessonSlug);
  if (!ders) notFound();

  const session = await getServerSession(authOptions);
  const uye = await aktifUyelikVarMi(session?.user?.id);

  // Giriş yapmış ama üyeliği yok/süresi dolmuş bir kullanıcı (admin hariç)
  // içerik sayfalarından hangisine girerse girsin doğrudan hesabım'a
  // yönlendirilir — bkz. app/[locale]/(site)/courses/[slug]/page.tsx.
  if (session?.user?.id && session.user.role !== "ADMIN" && !uye) {
    redirect(getPathname({ href: "/account", locale }));
  }

  const erisilebilir = uye || ders.ucretsizMi;
  if (!erisilebilir) {
    redirect(getPathname({ href: `/courses/${kurs.slug}?durum=uyelik-gerekli`, locale }));
  }

  const guncelIndex = kurs.lessons.findIndex((d) => d.slug === ders.slug);
  const sonrakiDers = kurs.lessons[guncelIndex + 1];
  const mood = ders.mood ? moodlar.find((m) => m.slug === ders.mood) : null;
  const moodEtiket = mood ? cevrilenAlan(mood.ad, mood.adEn, mood.adAz, locale) : null;
  const kursBaslik = cevrilenAlan(kurs.baslik, kurs.baslikEn, kurs.baslikAz, locale);
  const kursSeviyeEtiket = cevrilenAlan(kurs.seviye, kurs.seviyeEn, kurs.seviyeAz, locale);
  const dersBaslik = cevrilenAlan(ders.baslik, ders.baslikEn, ders.baslikAz, locale);

  return (
    <div className="container-nefes py-16 max-w-3xl">
      <Link href={`/courses/${kurs.slug}`} className="font-body text-sm text-metin/60 hover:text-metin">
        ← {kursBaslik}
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-metin mt-4">{dersBaslik}</h1>
      <p className="font-mono text-xs text-metin/45 mt-2">
        {ders.sureDakika} {t("dk")} · {kursSeviyeEtiket}
        {moodEtiket ? ` · ${moodEtiket}` : ""}
      </p>

      <div className="mt-8 aspect-video bg-koyu rounded-2xl overflow-hidden">
        {/*
          Yerel yüklenen dosyalar sunucudan doğrudan servis edilir; YouTube
          linkleri gömülü oynatıcıyla gösterilir. Üretimde büyük ölçekli bir
          kütüphane için Mux/Cloudflare Stream/Bunny Stream gibi imzalı-URL
          veren bir servise geçmek isteyebilirsiniz.
        */}
        {ders.videoUrl ? (
          <VideoPlayer url={ders.videoUrl} poster={ders.kapakUrl ?? kurs.kapakUrl} dersId={ders.id} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center px-6">
            <p className="font-body text-sm text-zemin/70">{t("videoBulunamadi")}</p>
          </div>
        )}
      </div>

      {sonrakiDers && (
        <div className="mt-8 flex justify-end">
          <Link
            href={`/courses/${kurs.slug}/${sonrakiDers.slug}`}
            className="font-body text-sm text-metin bg-cizgi/60 hover:bg-cizgi px-5 py-2.5 rounded-full transition-colors"
          >
            {t("sonrakiDers")}: {cevrilenAlan(sonrakiDers.baslik, sonrakiDers.baslikEn, sonrakiDers.baslikAz, locale)} →
          </Link>
        </div>
      )}
    </div>
  );
}
