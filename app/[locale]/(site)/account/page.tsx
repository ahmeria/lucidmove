import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { guncelUyelik } from "@/lib/uyelik";
import { db } from "@/lib/db";
import { moodlariAl } from "@/lib/moods";
import { intlEtiketi } from "@/lib/settings";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import type { AppLocale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import HesabimClient from "./HesabimClient";
import KursKatalogu from "../courses/KursKatalogu";

export const dynamic = "force-dynamic";

// Mobilde "Profil ayarları" yazılı buton yerine kullanılan ikon — dar
// ekranda satırın boğulmaması için.
function ProfilIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" strokeLinecap="round" />
    </svg>
  );
}

// Üyelik paneli — giriş sonrası iniş sayfası. Profil düzenleme (isim/telefon/
// fotoğraf) artık burada DEĞİL, ayrı bir alt sayfada (bkz. account/profile) —
// buradaki asıl odak kurslar ve izleme gelişimi.
export default async function Hesabim({ params }: { params: { locale: string } }) {
  const locale = params.locale as AppLocale;
  // Locale-doğru /login hedefi (returnTo da locale prefiksli) — next-intl'in
  // kendi redirect()'i next/navigation'a göre TS "never" daralmasını
  // tetiklemediği için burada string üretip düz redirect() ile çağırıyoruz.
  const girisHedefi = getPathname({
    href: { pathname: "/login", query: { returnTo: getPathname({ href: "/account", locale }) } },
    locale,
  });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(girisHedefi);
  // Adminin üye alanına düşmesi istenmiyor — her zaman doğrudan panele gider.
  // Admin paneli locale ağacının tamamen dışında olduğu için burada
  // düz (locale'siz) next/navigation redirect'i kullanılır.
  if (session.user.role === "ADMIN") redirect("/admin");

  const [kullanici, abonelik, kurslarHam, moodlar, tamamlananKayitlar, sonIzlenenler, t] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { ad: true },
    }),
    guncelUyelik(session.user.id),
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
    moodlariAl(),
    db.lessonProgress.findMany({
      where: { userId: session.user.id, tamamlandi: true },
      select: { lessonId: true },
    }),
    db.lessonProgress.findMany({
      where: { userId: session.user.id, tamamlandi: true },
      include: { lesson: { include: { course: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    getTranslations("account"),
  ]);
  if (!kullanici) redirect(girisHedefi);

  const PLAN_ETIKETI: Record<string, string> = { AYLIK: t("planAylik"), YILLIK: t("planYillik") };
  const DURUM_ETIKETI: Record<string, string> = {
    AKTIF: t("durumAktif"),
    IPTAL_EDILDI: t("durumIptalEdildi"),
    SUresi_DOLDU: t("durumSuresiDoldu"),
    BEKLEMEDE: t("durumOdemeBekliyor"),
  };

  // "guncelUyelik" statüsü AKTIF/İPTAL_EDİLDİ olan en son kaydı getirir ama
  // dönemin fiilen geçip geçmediğine bakmaz — DB'de hiçbir şey süresi geçince
  // status'ü otomatik "SUresi_DOLDU" yapmıyor (cron yok). Gerçek erişim,
  // her zaman currentPeriodEnd'in şu ana göre kontrolüyle belirlenir — bkz.
  // lib/uyelik.ts > aktifUyelikVarMi (aynı mantık, içerik erişiminde kullanılıyor).
  const erisimVar = !!abonelik && abonelik.currentPeriodEnd > new Date();

  const tamamlananSet = new Set(tamamlananKayitlar.map((k) => k.lessonId));
  // Herkese açık /courses sayfasıyla aynı kural: içinde hiç ders olmayan
  // kurslar (henüz hazırlanıyor demektir) listede görünmüyor.
  const kurslarDoluluk = kurslarHam.filter((k) => k.lessons.length > 0);

  // Üstteki "Gelişim" özeti için genel toplam/tamamlanan (KursKatalogu'nun
  // kendisi ilerleme göstermiyor — bu hesap yalnızca özet çubuk içindir).
  const genelToplam = kurslarDoluluk.reduce((s, k) => s + k.lessons.length, 0);
  const genelTamamlanan = kurslarDoluluk.reduce(
    (s, k) => s + k.lessons.filter((d) => tamamlananSet.has(d.id)).length,
    0,
  );
  const genelYuzde = genelToplam > 0 ? Math.round((genelTamamlanan / genelToplam) * 100) : 0;

  // Her seviye için "temsilci" bir kapak görseli — o seviyeye sahip İLK
  // kursun kapağı (herkese açık /courses sayfasındaki mantıkla aynı, bkz.
  // app/[locale]/(site)/courses/page.tsx > seviyeGorseli).
  const seviyeGorseli = new Map<string, { kapakUrl: string | null; etiket: string }>();
  for (const k of kurslarDoluluk) {
    if (!seviyeGorseli.has(k.seviye)) {
      seviyeGorseli.set(k.seviye, {
        kapakUrl: k.kapakUrl,
        etiket: cevrilenAlan(k.seviye, k.seviyeEn, k.seviyeAz, locale),
      });
    }
  }
  const seviyeler = Array.from(seviyeGorseli.entries()).map(([seviye, v]) => ({
    seviye,
    etiket: v.etiket,
    kapakUrl: v.kapakUrl,
  }));

  const moodEtiketleri = new Map(moodlar.map((m) => [m.slug, cevrilenAlan(m.ad, m.adEn, m.adAz, locale)]));
  // KursKatalogu'nun beklediği şekil — /courses sayfasıyla birebir aynı
  // (bkz. app/[locale]/(site)/courses/page.tsx): burası da o bileşeni
  // doğrudan kullanıyor, ayrı bir "üyelik paneli" varyantı yok.
  const kurslarIcinDersler = kurslarDoluluk.map((k) => ({
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
  }));

  return (
    <div className="container-nefes pt-8 sm:pt-10 pb-20 space-y-7 sm:space-y-14">
      {/* Üst satır — /courses'daki gibi düz, kutusuz bir başlık alanı. */}
      <div>
        <p className="font-mono text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-toprak mb-2 sm:mb-4">
          {t("uyelikPaneli")}
        </p>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-metin leading-tight">
          {t("merhaba", { ad: kullanici.ad })}
        </h1>
      </div>

      {/* Durum + Gelişim + Profil + İptal — tek satırlık, beyaz zeminli tek
          kart. Metin kısmı (Plan/Durum/tarih) taşarsa yan kaydırmalı olur ki
          ikonlar (Gelişim/Profil/İptal) her zaman sağda, tek satırda sabit
          kalsın — hiçbir zaman alt satıra düşmüyor. */}
      <div className="flex items-center gap-3 bg-kart border border-cizgi rounded-2xl shadow-organik px-4 sm:px-5 py-3.5">
        <div
          className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap kaydirma-cubugu-gizli font-body text-sm text-metin/80"
          style={{
            WebkitMaskImage: "linear-gradient(to right, black calc(100% - 1.5rem), transparent 100%)",
            maskImage: "linear-gradient(to right, black calc(100% - 1.5rem), transparent 100%)",
          }}
        >
          {!erisimVar ? (
            <span>{abonelik ? t("uyelikSuresiDoldu") : t("aktifUyelikYok")}</span>
          ) : (
            <>
              <span>
                <span className="text-metin/50">{t("plan")}:</span> {PLAN_ETIKETI[abonelik!.plan]}
              </span>
              <span className="mx-2.5 text-metin/25">·</span>
              <span>
                <span className="text-metin/50">{t("durum")}:</span> {DURUM_ETIKETI[abonelik!.status]}
              </span>
              <span className="mx-2.5 text-metin/25">·</span>
              <span>
                <span className="text-metin/50">
                  {abonelik!.status === "IPTAL_EDILDI" ? t("erisimBitisi") : t("yenilenme")}:
                </span>{" "}
                {new Intl.DateTimeFormat(intlEtiketi(locale), { dateStyle: "medium" }).format(abonelik!.currentPeriodEnd)}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!erisimVar && (
            <a
              href="/#membership"
              className="bg-toprak text-white px-4 py-2 rounded-full font-body text-sm hover:bg-toprak-dark transition-colors whitespace-nowrap"
            >
              {t("uyeOl")}
            </a>
          )}

          {genelToplam > 0 && (
            <div className="flex items-center gap-1.5 bg-zemin rounded-full pl-3 pr-1 py-1">
              <span className="font-mono text-[10px] text-metin/60 whitespace-nowrap">%{genelYuzde}</span>
              <div className="w-10 h-1.5 bg-cizgi rounded-full overflow-hidden">
                <div className="h-full bg-toprak rounded-full" style={{ width: `${genelYuzde}%` }} />
              </div>
            </div>
          )}

          <Link
            href="/account/profile"
            aria-label={t("profilAyarlari")}
            title={t("profilAyarlari")}
            className="flex items-center justify-center size-9 rounded-full text-metin/60 hover:text-metin hover:bg-zemin transition-colors"
          >
            <ProfilIkonu className="size-4" />
          </Link>

          {erisimVar && abonelik!.status === "AKTIF" && <HesabimClient />}
        </div>
      </div>

      {/* Kurs gözatma — herkese açık /courses sayfasıyla AYNI bileşen
          (KursKatalogu): aynı sekmeler/arama/filtrele araç çubuğu, aynı
          Seviyeler/Mood kartları, aynı kurs başına ders ızgarası. uyeMi burada
          gerçek erişim durumuna (erisimVar) bağlı — üyeliği olmayan/süresi
          dolan kullanıcı da panelde gezinebilir ama kilitli dersler için
          "Üye ol" ipucu görür. */}
      <KursKatalogu
        seviyeler={seviyeler}
        moodlar={moodlar.map((m) => ({ deger: m.slug, etiket: cevrilenAlan(m.ad, m.adEn, m.adAz, locale), kapakUrl: m.gorselUrl }))}
        kurslar={kurslarIcinDersler}
        uyeMi={erisimVar}
      />

      {/* Son izlenenler — kısa, "kaldığın yerden devam et" amaçlı */}
      {sonIzlenenler.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold text-metin mb-4">{t("sonIzlenenler")}</h2>
          <ul className="font-body text-sm divide-y divide-cizgi border-t border-cizgi">
            {sonIzlenenler.map((kayit) => (
              <li key={kayit.id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <Link
                    href={`/courses/${kayit.lesson.course.slug}/${kayit.lesson.slug}`}
                    className="text-metin hover:text-toprak-dark truncate block"
                  >
                    {cevrilenAlan(kayit.lesson.baslik, kayit.lesson.baslikEn, kayit.lesson.baslikAz, locale)}
                  </Link>
                  <p className="text-xs text-metin/45 mt-0.5 truncate">
                    {cevrilenAlan(kayit.lesson.course.baslik, kayit.lesson.course.baslikEn, kayit.lesson.course.baslikAz, locale)}
                  </p>
                </div>
                <span className="text-xs text-metin/40 whitespace-nowrap shrink-0">
                  {new Intl.DateTimeFormat(intlEtiketi(locale), { dateStyle: "medium" }).format(kayit.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
