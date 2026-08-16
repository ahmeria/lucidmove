import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import MembershipClient from "./membership/MembershipClient";
import Canlandir from "@/components/Canlandir";
import { db } from "@/lib/db";
import { cevrilenAlan, cevrilenAlanOpsiyonel } from "@/lib/i18nIcerik";
import {
  getSiteSettings,
  getInstructorProfile,
  getGaleriGorselleri,
  satirlaraAyir,
  paragraflaraAyir,
  formatFiyat,
} from "@/lib/settings";

// "Nefesinizin *hızında* bir yoga pratiği." -> yıldızlar arasındaki kısım vurgulanır.
// Hero koyu bir video üzerinde durduğu için vurgu rengi sitenin marka
// yeşili değil, sıcak "toprak-light" (karamel) — koyu overlay üzerinde daha
// iyi okunuyor ve anasayfanın sıcak paletiyle uyumlu. Bu işaretleme (*...*)
// hangi dilde girilirse girilsin aynı şekilde çalışır (bkz. admin Sayfa
// Tasarımı > Hero başlık alanı yardımcı metni).
function VurgulaYildiz({ metin }: { metin: string }) {
  const parcalar = metin.split(/\*(.+?)\*/);
  return (
    <>
      {parcalar.map((parca, i) =>
        i % 2 === 1 ? (
          <em key={i} className="not-italic text-toprak-light">
            {parca}
          </em>
        ) : (
          <span key={i}>{parca}</span>
        )
      )}
    </>
  );
}

export default async function Anasayfa({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { durum?: string };
}) {
  const locale = params.locale as AppLocale;
  const [ayarlar, egitmen, galeriGorselleri, planlar, t] = await Promise.all([
    getSiteSettings(),
    getInstructorProfile(),
    getGaleriGorselleri(),
    db.pricingPlan.findMany({ orderBy: { sira: "asc" } }),
    getTranslations("home"),
  ]);

  const bio = cevrilenAlan(egitmen.bio, egitmen.bioEn, egitmen.bioAz, locale);
  const sertifikalarMetin = cevrilenAlan(egitmen.sertifikalar, egitmen.sertifikalarEn, egitmen.sertifikalarAz, locale);
  const yaklasimMetin = cevrilenAlan(egitmen.yaklasim, egitmen.yaklasimEn, egitmen.yaklasimAz, locale);
  const teaserOzet = cevrilenAlanOpsiyonel(
    egitmen.hakkimdaTeaserOzet,
    egitmen.hakkimdaTeaserOzetEn,
    egitmen.hakkimdaTeaserOzetAz,
    locale
  );
  const bioParagraflari = paragraflaraAyir(bio);
  const sertifikalar = satirlaraAyir(sertifikalarMetin);
  const yaklasim = satirlaraAyir(yaklasimMetin);
  const instagramHandle = "@" + ayarlar.instagramUrl.replace(/\/$/, "").split("/").pop();

  const heroEyebrow = cevrilenAlan(ayarlar.heroEyebrow, ayarlar.heroEyebrowEn, ayarlar.heroEyebrowAz, locale);
  const heroBaslik = cevrilenAlan(ayarlar.heroBaslik, ayarlar.heroBaslikEn, ayarlar.heroBaslikAz, locale);
  const heroAltBaslik = cevrilenAlan(ayarlar.heroAltBaslik, ayarlar.heroAltBaslikEn, ayarlar.heroAltBaslikAz, locale);
  const heroCtaBirincil = cevrilenAlan(
    ayarlar.heroCtaBirincil,
    ayarlar.heroCtaBirincilEn,
    ayarlar.heroCtaBirincilAz,
    locale
  );
  const heroCtaIkincil = cevrilenAlan(ayarlar.heroCtaIkincil, ayarlar.heroCtaIkincilEn, ayarlar.heroCtaIkincilAz, locale);
  const uyelikEyebrow = cevrilenAlan(ayarlar.uyelikEyebrow, ayarlar.uyelikEyebrowEn, ayarlar.uyelikEyebrowAz, locale);
  const uyelikBaslik = cevrilenAlan(ayarlar.uyelikBaslik, ayarlar.uyelikBaslikEn, ayarlar.uyelikBaslikAz, locale);
  const uyelikAltBaslik = cevrilenAlan(
    ayarlar.uyelikAltBaslik,
    ayarlar.uyelikAltBaslikEn,
    ayarlar.uyelikAltBaslikAz,
    locale
  );

  return (
    <div>
      {/* HERO — arkaplan admin panelden yönetilir (bkz. Sayfa Tasarımı > Hero &
          Üyelik): video yüklenmişse video oynatılır (görsel, video yüklenene
          kadar/oynatılamazsa poster olarak kullanılır), video yoksa görsel
          doğrudan statik arkaplan olarak gösterilir. */}
      <section className="relative h-screen w-full overflow-hidden">
        {ayarlar.heroVideoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={ayarlar.heroGorselUrl}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={ayarlar.heroVideoUrl} />
          </video>
        ) : (
          <Image src={ayarlar.heroGorselUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-koyu/70 via-koyu/10 to-koyu/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/10" />

        <div className="relative h-full container-nefes flex flex-col items-center justify-center text-center">
          <div className="max-w-xl animate-riseIn flex flex-col items-center">
            <p className="font-mono text-[11px] sm:text-xs tracking-[0.35em] uppercase text-white/70 mb-5">
              {heroEyebrow}
            </p>
            <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.08] text-white">
              <VurgulaYildiz metin={heroBaslik} />
            </h1>
            <p className="font-body text-base sm:text-lg text-white/75 mt-5 max-w-md leading-relaxed">
              {heroAltBaslik}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <Link
                href="/#membership"
                className="border border-white/60 bg-white/10 backdrop-blur-sm text-white px-7 py-3.5 rounded-full font-body text-sm hover:bg-white/20 hover:border-white transition-colors inline-flex items-center gap-2"
              >
                {heroCtaBirincil} <span aria-hidden>→</span>
              </Link>
              <Link
                href="/courses"
                className="border border-white/60 bg-white/10 backdrop-blur-sm text-white px-7 py-3.5 rounded-full font-body text-sm hover:bg-white/20 hover:border-white transition-colors"
              >
                {heroCtaIkincil}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HAKKIMDA — hero'nun hemen altında, üyelikten önce: ziyaretçi önce
          eğitmeni tanısın, sonra plan seçsin (Magda Werner referansındaki
          Hero -> Bio -> Pricing akışı). */}
      <section id="about" className="bg-koyu text-zemin scroll-mt-20">
        <div className="container-nefes py-28 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
          <Canlandir className="relative aspect-[4/5] foto-organik overflow-hidden lg:sticky lg:top-28">
            <Image
              src={egitmen.portreUrl}
              alt={egitmen.ad}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </Canlandir>

          <Canlandir gecikme={100}>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-toprak-light mb-5">{t("egitmen")}</p>
            {teaserOzet && (
              <p className="font-display italic text-2xl sm:text-3xl leading-snug text-zemin/95 mb-8 max-w-lg">
                “{teaserOzet}”
              </p>
            )}
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              {t("merhabaBen", { ad: egitmen.ad })}
            </h2>
            <div className="font-body text-zemin/75 mt-6 space-y-5 leading-relaxed max-w-xl">
              {bioParagraflari.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              <div className="bg-zemin/5 border border-zemin/15 rounded-[1.5rem] p-6">
                <p className="font-mono text-xs text-toprak-light uppercase tracking-[0.2em]">{t("sertifikalar")}</p>
                <ul className="font-body text-sm text-zemin/80 mt-3 space-y-1.5">
                  {sertifikalar.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-zemin/5 border border-zemin/15 rounded-[1.5rem] p-6">
                <p className="font-mono text-xs text-toprak-light uppercase tracking-[0.2em]">{t("yaklasim")}</p>
                <ul className="font-body text-sm text-zemin/80 mt-3 space-y-1.5">
                  {yaklasim.map((y, i) => (
                    <li key={i}>{y}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 mt-10">
              <Link
                href="/#membership"
                className="inline-block bg-toprak text-white px-7 py-3.5 rounded-full font-body text-sm hover:bg-toprak-dark transition-colors"
              >
                {t("derslerimeKatilin")}
              </Link>
              <a
                href={ayarlar.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-zemin/70 hover:text-zemin border-b border-zemin/30 hover:border-zemin transition-colors"
              >
                {instagramHandle} →
              </a>
            </div>
          </Canlandir>
        </div>
      </section>

      {/* ÜYELİK / FİYATLANDIRMA */}
      {/* Not: bölüm koşulsuz render edilir (yalnızca içerik dallanır) — aksi halde
          admin tüm planları silerse "#membership" çapası DOM'dan kaybolur ve navbar/footer/
          hero'daki tüm "#membership" linkleri sessizce hiçbir yere gitmez. */}
      <section id="membership" className="container-nefes py-28 scroll-mt-20">
        <Canlandir className="text-center max-w-xl mx-auto mb-14">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-toprak mb-3">{uyelikEyebrow}</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-metin">{uyelikBaslik}</h2>
          <p className="font-body text-metin/70 mt-3">{uyelikAltBaslik}</p>
        </Canlandir>

        {planlar.length === 0 ? (
          <p className="font-body text-metin/60 text-center">{t("uyelikPlanYok")}</p>
        ) : (
          <Canlandir gecikme={100}>
            <MembershipClient
              baslangicDurum={searchParams.durum}
              planlar={planlar.map((p) => ({
                plan: p.plan,
                baslik: cevrilenAlan(p.baslik, p.baslikEn, p.baslikAz, locale),
                fiyat: formatFiyat(p.fiyat.toNumber(), ayarlar, locale),
                periyot: cevrilenAlan(p.periyot, p.periyotEn, p.periyotAz, locale),
                aciklama: cevrilenAlan(p.aciklama, p.aciklamaEn, p.aciklamaAz, locale),
                ozellikler: satirlaraAyir(cevrilenAlan(p.ozellikler, p.ozelliklerEn, p.ozelliklerAz, locale)),
                rozet: cevrilenAlanOpsiyonel(p.rozet, p.rozetEn, p.rozetAz, locale),
                vurgulu: p.vurgulu,
              }))}
            />
          </Canlandir>
        )}
      </section>

      {/* GALERİ — admin panelden yönetilir (bkz. app/admin/settings/page-design) */}
      {galeriGorselleri.length > 0 && (
        <section className="container-nefes pb-28">
          <Canlandir className="text-center max-w-xl mx-auto mb-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-toprak mb-3">{t("studyodanKareler")}</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-metin">{t("pratikIcinden")}</h2>
          </Canlandir>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {galeriGorselleri.map((g, i) => (
              <Canlandir
                key={g.id}
                gecikme={i * 70}
                className={`relative aspect-square rounded-2xl overflow-hidden ${i % 2 === 1 ? "sm:mt-8" : ""}`}
              >
                <Image
                  src={g.url}
                  alt={g.alt || t("studyodanBirKare")}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </Canlandir>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
