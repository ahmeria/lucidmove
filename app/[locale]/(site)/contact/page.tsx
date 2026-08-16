import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/settings";
import IletisimForm from "./IletisimForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "contact" });
  return { title: t("metaBaslik"), description: t("metaAciklama") };
}

export default async function Iletisim() {
  const [ayarlar, t] = await Promise.all([getSiteSettings(), getTranslations("contact")]);

  return (
    <div className="container-nefes py-20 grid lg:grid-cols-2 gap-14">
      <div>
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-4">{t("eyebrow")}</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-metin leading-tight">{t("baslik")}</h1>
        <p className="font-body text-metin/70 mt-5 max-w-md leading-relaxed">{t("aciklama")}</p>

        <div className="mt-10 space-y-4 font-body text-sm text-metin/75">
          <p>
            <span className="text-metin/50">{t("eposta")}:</span> {ayarlar.iletisimEmail}
          </p>
          <p>
            <span className="text-metin/50">{t("calismaSaatleri")}:</span> {ayarlar.calismaSaatleri}
          </p>
        </div>
      </div>

      <IletisimForm />
    </div>
  );
}
