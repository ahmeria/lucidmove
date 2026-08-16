import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { aktifUyelikVarMi } from "@/lib/uyelik";
import { moodlariAl } from "@/lib/moods";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import type { AppLocale } from "@/i18n/routing";
import { localeUrl, localeAlternates } from "@/lib/seo";
import KursKatalogu from "./KursKatalogu";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale as AppLocale;
  const t = await getTranslations({ locale, namespace: "coursesPage" });
  const baslik = t("metaBaslik");
  const aciklama = t("metaAciklama");
  return {
    title: baslik,
    description: aciklama,
    alternates: localeAlternates("/courses", locale),
    openGraph: { title: baslik, description: aciklama, url: localeUrl("/courses", locale) },
  };
}

// Herkese açık kurs kataloğu — Magda Werner referansındaki "Online Studio"
// sayfasına karşılık gelir: üstte Seviyeler, altta Moodlar (her ikisi de
// birer görsel "kısayol" kartı — tıklanınca aşağıdaki listeyi filtreler),
// en altta her kurs kendi başlığıyla, altında o kursun ders kartları
// (video yoksa kurs hiç listelenmez). Anonim/üyeliksiz ziyaretçiler
// kartları görüp önizleme sayfasına gidebilir; üzerine gelince kilit +
// "Üye ol" ipucu çıkar — aktif üyeliği olana gösterilmez.
export default async function KurslarSayfasi({ params }: { params: { locale: string } }) {
  const locale = params.locale as AppLocale;
  const session = await getServerSession(authOptions);
  const [uyeMi, moodlar, kurslar] = await Promise.all([
    aktifUyelikVarMi(session?.user?.id),
    moodlariAl(),
    db.course.findMany({
      orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
      include: {
        lessons: {
          orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            slug: true,
            baslik: true,
            baslikEn: true,
            baslikAz: true,
            kapakUrl: true,
            sureDakika: true,
            mood: true,
            ucretsizMi: true,
          },
        },
      },
    }),
  ]);

  const moodEtiketleri = new Map(moodlar.map((m) => [m.slug, cevrilenAlan(m.ad, m.adEn, m.adAz, locale)]));

  // Her seviye için "temsilci" bir kapak görseli — o seviyeye sahip İLK
  // kursun kapağı (sira sırasına göre). Görsel yoksa kart düz renkle düşer.
  // Mood'ların kendi görseli zaten admin panelinden (bkz. app/admin/moods)
  // doğrudan ayarlanıyor, buradan türetmeye gerek yok. Seviye GRUPLAMA
  // anahtarı hep Türkçe (k.seviye) kalıyor, yalnızca gösterim etiketi çevrilir.
  const seviyeGorseli = new Map<string, { kapakUrl: string | null; etiket: string }>();
  for (const k of kurslar) {
    if (!seviyeGorseli.has(k.seviye)) {
      seviyeGorseli.set(k.seviye, {
        kapakUrl: k.kapakUrl,
        etiket: cevrilenAlan(k.seviye, k.seviyeEn, k.seviyeAz, locale),
      });
    }
  }

  return (
    <div className="container-nefes pt-8 sm:pt-10 pb-24">
      {/* Görsel bir sayfa başlığı yok (referanstaki gibi doğrudan araç
          çubuğuyla başlıyor) — ama erişilebilirlik/SEO için sayfanın gerçek
          bir h1'i olsun diye ekrandan gizli tutuluyor (bkz. yukarıdaki
          <title>, ziyaretçiye zaten orada görünüyor). */}
      <h1 className="sr-only">Kurslar</h1>

      <KursKatalogu
        seviyeler={Array.from(seviyeGorseli.entries()).map(([seviye, v]) => ({
          seviye,
          etiket: v.etiket,
          kapakUrl: v.kapakUrl,
        }))}
        moodlar={moodlar.map((m) => ({ deger: m.slug, etiket: cevrilenAlan(m.ad, m.adEn, m.adAz, locale), kapakUrl: m.gorselUrl }))}
        kurslar={kurslar
          .filter((k) => k.lessons.length > 0)
          .map((k) => ({
            id: k.id,
            slug: k.slug,
            baslik: cevrilenAlan(k.baslik, k.baslikEn, k.baslikAz, locale),
            seviye: k.seviye,
            seviyeEtiket: cevrilenAlan(k.seviye, k.seviyeEn, k.seviyeAz, locale),
            dersler: k.lessons.map((d) => ({
              id: d.id,
              slug: d.slug,
              baslik: cevrilenAlan(d.baslik, d.baslikEn, d.baslikAz, locale),
              kapakUrl: d.kapakUrl,
              sureDakika: d.sureDakika,
              mood: d.mood,
              moodEtiket: d.mood ? (moodEtiketleri.get(d.mood) ?? null) : null,
              ucretsizMi: d.ucretsizMi,
            })),
          }))}
        uyeMi={uyeMi}
      />
    </div>
  );
}
