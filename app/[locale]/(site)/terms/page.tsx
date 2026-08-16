import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { getSiteSettings, intlEtiketi } from "@/lib/settings";
import { localeUrl, localeAlternates } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("terms"), getLocale()]);
  const baslik = t("metaBaslik");
  const aciklama = t("metaAciklama");
  return {
    title: baslik,
    description: aciklama,
    alternates: localeAlternates("/terms", locale as AppLocale),
    openGraph: { title: baslik, description: aciklama, url: localeUrl("/terms", locale as AppLocale) },
  };
}

export const dynamic = "force-dynamic";

export default async function KullanimSartlari() {
  const [t, ayarlar, locale] = await Promise.all([getTranslations("terms"), getSiteSettings(), getLocale()]);
  const marka = ayarlar.siteBasligi.split("—")[0].trim() || "LucidMove";
  const sonGuncelleme = new Intl.DateTimeFormat(intlEtiketi(locale as AppLocale), { dateStyle: "long" }).format(
    new Date()
  );

  const bolumler = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    baslik: t(`s${n}Baslik`),
    metin: t(`s${n}Metin`, { marka, eposta: ayarlar.iletisimEmail }),
  }));

  return (
    <div className="container-nefes py-20 max-w-2xl">
      <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-4">{t("yasal")}</p>
      <h1 className="font-display text-4xl font-bold text-metin leading-tight">{t("baslik")}</h1>
      <p className="font-body text-sm text-metin/50 mt-3">{t("sonGuncelleme", { tarih: sonGuncelleme })}</p>

      <div className="font-body text-metin/75 mt-10 space-y-8 leading-relaxed">
        <p className="text-sm bg-vurgu/10 border border-vurgu/30 rounded-xl p-4">{t("uyari")}</p>

        {bolumler.map((b, i) => (
          <section key={i}>
            <h2 className="font-display text-xl font-bold text-metin mb-2">{b.baslik}</h2>
            <p>{b.metin}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
