import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { aktifUyelikVarMi } from "@/lib/uyelik";
import { moodlariAl } from "@/lib/moods";
import { cevrilenAlan } from "@/lib/i18nIcerik";
import type { AppLocale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import DersKarti from "../DersKarti";

export const dynamic = "force-dynamic";

export default async function KursDetay({ params }: { params: { slug: string; locale: string } }) {
  const locale = params.locale as AppLocale;
  const [kurs, moodlar, t] = await Promise.all([
    db.course.findUnique({
      where: { slug: params.slug },
      include: { lessons: { orderBy: { sira: "asc" } } },
    }),
    moodlariAl(),
    getTranslations("courseDetail"),
  ]);

  if (!kurs) notFound();

  const moodEtiketleri = new Map(moodlar.map((m) => [m.slug, cevrilenAlan(m.ad, m.adEn, m.adAz, locale)]));

  const session = await getServerSession(authOptions);
  const uye = await aktifUyelikVarMi(session?.user?.id);

  // Giriş yapmış ama üyeliği yok/süresi dolmuş bir kullanıcı (admin hariç)
  // içerik sayfalarından hangisine girerse girsin doğrudan hesabım'a
  // yönlendirilir — orada üyeliğini yenileyebilir. Anonim ziyaretçiler
  // (session yok) kursu tanıtım amaçlı görmeye devam edebilir.
  if (session?.user?.id && session.user.role !== "ADMIN" && !uye) {
    redirect(getPathname({ href: "/account", locale }));
  }

  const toplamDakika = kurs.lessons.reduce((t, d) => t + d.sureDakika, 0);
  const kursBaslik = cevrilenAlan(kurs.baslik, kurs.baslikEn, kurs.baslikAz, locale);
  const kursAciklama = cevrilenAlan(kurs.aciklama, kurs.aciklamaEn, kurs.aciklamaAz, locale);
  const kursSeviyeEtiket = cevrilenAlan(kurs.seviye, kurs.seviyeEn, kurs.seviyeAz, locale);

  return (
    <div>
      {/* HERO — kapak görseli/tanıtım videosu artık her zaman görünür, konu
          bilgisi ve görsel tam genişlikteki bir iki-sütun yerleşimini paylaşır. */}
      <section className="container-nefes pt-14 sm:pt-20 pb-20">
        <Link
          href="/courses"
          className="font-mono text-xs text-metin/50 hover:text-metin transition-colors inline-flex items-center gap-1.5 mb-8"
        >
          ← {t("tumKurslar")}
        </Link>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-toprak-dark">
              {kursSeviyeEtiket}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-metin mt-3 leading-tight">
              {kursBaslik}
            </h1>
            <p className="font-body text-metin/70 mt-5 leading-relaxed">{kursAciklama}</p>

            <div className="flex items-center gap-4 mt-6 font-mono text-xs text-metin/50 uppercase tracking-wide">
              <span>{t("dersSayisi", { count: kurs.lessons.length })}</span>
              <span className="size-1 rounded-full bg-metin/25" />
              <span>{t("toplamDakika", { count: toplamDakika })}</span>
            </div>

            {!uye && (
              <div className="mt-8 border border-toprak/40 bg-toprak/10 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
                <p className="font-body text-sm text-metin/80">{t("uyelikGerekli")}</p>
                <Link
                  href="/#membership"
                  className="bg-toprak text-white px-6 py-3 rounded-full font-body text-sm whitespace-nowrap hover:bg-toprak-dark transition-colors"
                >
                  {t("uyeOl")}
                </Link>
              </div>
            )}
          </div>

          <div className="relative aspect-[4/3] foto-organik overflow-hidden shadow-organik-hover bg-koyu">
            {kurs.tanitimVideoUrl ? (
              <VideoPlayer url={kurs.tanitimVideoUrl} poster={kurs.kapakUrl} />
            ) : kurs.kapakUrl ? (
              <Image
                src={kurs.kapakUrl}
                alt={kursBaslik}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* DERSLER — herkese açık kurs kataloğuyla (bkz. app/[locale]/(site)/
          courses/KursKatalogu.tsx) aynı görsel/kart dili: her ders görseli +
          başlığı + süre · seviye · mood metadata satırıyla, paylaşılan
          DersKarti bileşeni üzerinden. */}
      <section className="container-nefes pb-24">
        <h2 className="font-display text-2xl font-bold text-metin mb-8">{t("dersler")}</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {kurs.lessons.map((ders) => (
            <DersKarti
              key={ders.id}
              ders={{
                id: ders.id,
                slug: ders.slug,
                baslik: cevrilenAlan(ders.baslik, ders.baslikEn, ders.baslikAz, locale),
                kapakUrl: ders.kapakUrl,
                sureDakika: ders.sureDakika,
                mood: ders.mood,
                moodEtiket: ders.mood ? (moodEtiketleri.get(ders.mood) ?? null) : null,
                ucretsizMi: ders.ucretsizMi,
              }}
              kursSlug={kurs.slug}
              kursSeviye={kursSeviyeEtiket}
              uyeMi={uye}
              dkEtiketi={t("dk")}
              uyeOlEtiketi={t("uyeOl")}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
