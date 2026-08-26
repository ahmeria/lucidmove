import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteSettings, formatFiyat, intlEtiketi, markaAdi } from "@/lib/settings";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import { kalanKontenjaniHesapla, sonRezervasyonuGetir } from "@/lib/kamplar";
import { SITE_URL, localeUrl, localeAlternates, ogLocale, mutlakGorselUrl } from "@/lib/seo";
import { jsonLdGuvenli } from "@/lib/jsonLd";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import KampAksiyonlari from "./KampAksiyonlari";

export const dynamic = "force-dynamic";

// generateMetadata + sayfanın kendisi aynı kampı ayrı ayrı sorgulamasın diye
// (bkz. courses/[slug]/page.tsx'teki aynı gerekçe) React cache().
const kampiGetir = cache((slug: string) => db.camp.findUnique({ where: { slug } }));

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const locale = params.locale as AppLocale;
  const [kamp, ayarlar] = await Promise.all([kampiGetir(params.slug), getSiteSettings()]);
  // Yayında olmayan bir kamp için de sayfa gövdesi notFound() dönüyor (bkz.
  // aşağıdaki bileşen) — ama generateMetadata AYRI bir çağrı, o kontrolü
  // paylaşmıyor. Burada da kontrol edilmezse taslak bir kampın başlığı/
  // açıklaması, sayfa 404 gösterse bile <head>'e (title/OG) sızardı.
  if (!kamp || !kamp.yayindaMi) return {};

  const marka = markaAdi(ayarlar, locale);
  const ad = cevrilenAlan(kamp.ad, kamp.adEn, kamp.adAz, locale);
  const detaylar = cevrilenAlan(kamp.detaylar, kamp.detaylarEn, kamp.detaylarAz, locale);
  const baslik = `${ad} — ${marka}`;
  const yol = `/camps/${kamp.slug}`;

  return {
    title: baslik,
    description: detaylar,
    alternates: localeAlternates(yol, locale),
    openGraph: {
      title: baslik,
      description: detaylar,
      url: localeUrl(yol, locale),
      images: kamp.kapakUrl ? [{ url: kamp.kapakUrl }] : undefined,
      locale: ogLocale(locale),
      type: "website",
    },
  };
}

export default async function KampDetay({
  params,
  searchParams,
}: {
  params: { slug: string; locale: string };
  searchParams: { durum?: string };
}) {
  const locale = params.locale as AppLocale;
  const kamp = await kampiGetir(params.slug);
  // Yayında olmayan bir kamp herkes için (admin dahil) 404 — admin önizlemeyi
  // düzenleme ekranından yapar (bkz. app/admin/camps/[id]/edit).
  if (!kamp || !kamp.yayindaMi) notFound();

  const [ayarlar, t, session] = await Promise.all([
    getSiteSettings(),
    getTranslations("camps"),
    getServerSession(authOptions),
  ]);
  const [kalanKontenjan, sonRezervasyon] = await Promise.all([
    kalanKontenjaniHesapla(kamp),
    session?.user?.id ? sonRezervasyonuGetir(kamp.id, session.user.id) : Promise.resolve(null),
  ]);

  const ad = cevrilenAlan(kamp.ad, kamp.adEn, kamp.adAz, locale);
  const yer = cevrilenAlan(kamp.yer, kamp.yerEn, kamp.yerAz, locale);
  const detaylar = cevrilenAlan(kamp.detaylar, kamp.detaylarEn, kamp.detaylarAz, locale);
  const fiyatMetni = formatFiyat(kamp.fiyat.toNumber(), ayarlar, locale);

  const tarihFormat = new Intl.DateTimeFormat(intlEtiketi(locale), { day: "numeric", month: "long", year: "numeric" });
  const tarihAraligi = `${tarihFormat.format(kamp.baslangicTarihi)} – ${tarihFormat.format(kamp.bitisTarihi)}`;

  const kampJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ad,
    description: detaylar,
    startDate: kamp.baslangicTarihi.toISOString(),
    endDate: kamp.bitisTarihi.toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    // "address" Google'ın Event zengin sonuçları için ZORUNLU bir location
    // alt-alanı — eksikse yapılandırılmış veri testinde hata veriyordu. Camp
    // modelinde ayrı sokak/şehir/ülke alanları yok, yalnızca serbest metin
    // "yer" (ör. "Kapadokya, Türkiye") var; schema.org address hem
    // PostalAddress hem düz Text kabul ettiğinden var olan veriyi olduğu gibi
    // veriyoruz — sahte bir PostalAddress uydurmuyoruz.
    location: { "@type": "Place", name: yer, address: yer },
    organizer: { "@type": "Organization", name: markaAdi(ayarlar, locale), url: SITE_URL },
    ...(mutlakGorselUrl(kamp.kapakUrl) ? { image: mutlakGorselUrl(kamp.kapakUrl) } : {}),
    offers: {
      "@type": "Offer",
      price: kamp.fiyat.toString(),
      priceCurrency: ayarlar.paraBirimi,
      url: localeUrl(`/camps/${kamp.slug}`, locale),
      availability: kalanKontenjan > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGuvenli(kampJsonLd) }} />
      {/* HERO — kurs detay sayfasıyla aynı iki-sütun yerleşim (bkz.
          courses/[slug]/page.tsx). */}
      <section className="container-nefes pt-14 sm:pt-20 pb-20">
        <Link
          href="/#camps"
          className="font-mono text-xs text-metin/50 hover:text-metin transition-colors inline-flex items-center gap-1.5 mb-8"
        >
          ← {t("geriDon")}
        </Link>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-toprak-dark">{yer}</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-metin mt-3 leading-tight">{ad}</h1>
            <p className="font-body text-metin/70 mt-5 leading-relaxed">{detaylar}</p>

            <div className="flex flex-wrap items-center gap-4 mt-6 font-mono text-xs text-metin/50 uppercase tracking-wide">
              <span>{tarihAraligi}</span>
              <span className="size-1 rounded-full bg-metin/25" />
              <span>
                {kalanKontenjan > 0 ? t("kalanKontenjan", { count: kalanKontenjan }) : t("dolu")}
              </span>
            </div>

            <p className="font-display text-2xl font-bold text-metin mt-6">{fiyatMetni}</p>

            <KampAksiyonlari
              slug={kamp.slug}
              kalanKontenjan={kalanKontenjan}
              sonRezervasyon={
                sonRezervasyon
                  ? { status: sonRezervasyon.status, sonOdemeTarihi: sonRezervasyon.sonOdemeTarihi.toISOString() }
                  : null
              }
              baslangicDurum={searchParams.durum}
            />
          </div>

          <div className="relative aspect-[4/3] foto-organik overflow-hidden shadow-organik-hover bg-koyu">
            {kamp.kapakUrl && (
              <Image
                src={kamp.kapakUrl}
                alt={ad}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
