"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DersKarti, { type DersKartiVerisi } from "./DersKarti";
import TemaKarti, { type TemaOgesi } from "./TemaKarti";

type Ders = DersKartiVerisi;

interface Kurs {
  id: string;
  slug: string;
  baslik: string;
  seviye: string;
  seviyeEtiket: string;
  dersler: Ders[];
}

function AramaIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.5-4.5" strokeLinecap="round" />
    </svg>
  );
}

function FiltreIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M4 7h10M18 7h2M4 17h2M8 17h12" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="6" cy="17" r="2" />
    </svg>
  );
}

export default function KursKatalogu({
  seviyeler,
  moodlar,
  kurslar,
  uyeMi,
}: {
  seviyeler: { seviye: string; etiket: string; kapakUrl: string | null }[];
  moodlar: TemaOgesi[];
  kurslar: Kurs[];
  uyeMi: boolean;
}) {
  const t = useTranslations("coursesPage");
  const [aktifSeviye, setAktifSeviye] = useState<string | null>(null);
  const [aktifMood, setAktifMood] = useState<string | null>(null);
  const [aktifKursId, setAktifKursId] = useState<string | null>(null);
  const [arama, setArama] = useState("");
  const filtreAktif = aktifSeviye !== null || aktifMood !== null || aktifKursId !== null || arama.trim() !== "";

  function filtreleriTemizle() {
    setAktifSeviye(null);
    setAktifMood(null);
    setAktifKursId(null);
    setArama("");
  }

  // Seviye/kurs sekmesi kursu bütünüyle eler; mood ve arama ise yalnızca o
  // kursun İÇİNDEKİ dersleri daraltır (kurs, eşleşen en az bir dersi varsa
  // listede kalır). Arama, kurs adıyla eşleşiyorsa o kursun TÜM derslerini
  // bırakır; yoksa yalnızca ders adıyla eşleşenleri.
  const aramaKucuk = arama.trim().toLocaleLowerCase("tr");
  const gosterilecekKurslar = kurslar
    .filter((k) => !aktifSeviye || k.seviye === aktifSeviye)
    .filter((k) => !aktifKursId || k.id === aktifKursId)
    .map((k) => {
      let dersler = aktifMood ? k.dersler.filter((d) => d.mood === aktifMood) : k.dersler;
      if (aramaKucuk && !k.baslik.toLocaleLowerCase("tr").includes(aramaKucuk)) {
        dersler = dersler.filter((d) => d.baslik.toLocaleLowerCase("tr").includes(aramaKucuk));
      }
      return { ...k, dersler };
    })
    .filter((k) => k.dersler.length > 0);

  if (kurslar.length === 0) {
    return <p className="font-body text-metin/60">{t("henuzKursYok")}</p>;
  }

  // Üstten tek bir kurs seçildiğinde (aktifKursId dolu) o kurs zaten tek
  // başına gösterildiği için mobilde de yana kaydıran şerit yerine referanstaki
  // gibi düz bir 2 sütunlu ızgaraya geçiliyor. "Tümü" görünümünde ise birden
  // çok kurs alt alta dizildiğinden sayfa aşırı uzamasın diye şerit kalıyor.
  const tekKursSecili = aktifKursId !== null;
  const dersIzgaraSinifi = tekKursSecili
    ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-7"
    : "flex gap-5 overflow-x-auto kaydirma-cubugu-gizli snap-x snap-mandatory sm:overflow-visible sm:snap-none sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-7";
  const dersOgeSinifi = tekKursSecili ? "" : "w-[62%] shrink-0 snap-start sm:w-auto sm:shrink";

  return (
    <div className="space-y-14">
      {/* ÜST ÇUBUK — kurs adlarından oluşan sekmeler + arama + filtreleri
          temizleme. Kategori kaldırıldığı için sekmeler kurgusal bir
          taksonomi yerine gerçek kurs adlarına dayanıyor. */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto kaydirma-cubugu-gizli max-w-full">
          <button
            type="button"
            onClick={() => setAktifKursId(null)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-body text-sm transition-colors cursor-pointer ${
              aktifKursId === null ? "bg-kart shadow-organik text-metin font-medium" : "text-toprak-dark hover:text-toprak"
            }`}
          >
            {t("tumu")}
          </button>
          {kurslar.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setAktifKursId((v) => (v === k.id ? null : k.id))}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-body text-sm transition-colors cursor-pointer ${
                aktifKursId === k.id ? "bg-kart shadow-organik text-metin font-medium" : "text-toprak-dark hover:text-toprak"
              }`}
            >
              {k.baslik}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <div className="relative flex-1 min-w-0 sm:flex-none">
            <AramaIkonu className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-metin/35 pointer-events-none" />
            <input
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder={t("ara")}
              aria-label={t("dersVeyaKursAra")}
              className="w-full sm:w-56 rounded-full bg-kart border border-cizgi pl-10 pr-4 py-2 font-body text-sm text-metin placeholder:text-metin/40 focus:border-toprak outline-none"
            />
          </div>
          <button
            type="button"
            onClick={filtreleriTemizle}
            disabled={!filtreAktif}
            title={filtreAktif ? t("filtreleriTemizle") : t("aktifFiltreYok")}
            className="shrink-0 flex items-center gap-2 rounded-full bg-toprak text-white px-4 py-2 font-body text-sm hover:bg-toprak-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FiltreIkonu className="size-4" />
            {t("filtrele")}
          </button>
        </div>
      </div>

      {seviyeler.length > 1 && aktifKursId === null && (
        <div>
          <h2 className="font-display text-lg font-bold text-metin mb-4">{t("seviyeler")}</h2>
          <div className="flex gap-4 overflow-x-auto kaydirma-cubugu-gizli snap-x snap-mandatory sm:overflow-visible sm:snap-none sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
            {seviyeler.map((s) => (
              <div key={s.seviye} className="w-[62%] shrink-0 snap-start sm:w-auto sm:shrink">
                <TemaKarti
                  oge={{ deger: s.seviye, etiket: s.etiket, kapakUrl: s.kapakUrl }}
                  aktif={aktifSeviye === s.seviye}
                  onClick={() => setAktifSeviye((v) => (v === s.seviye ? null : s.seviye))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {moodlar.length > 0 && aktifKursId === null && (
        <div>
          <h2 className="font-display text-lg font-bold text-metin mb-4">{t("mood")}</h2>
          <div className="flex gap-4 overflow-x-auto kaydirma-cubugu-gizli snap-x snap-mandatory sm:overflow-visible sm:snap-none sm:grid sm:grid-cols-4 sm:gap-5">
            {moodlar.map((m) => (
              <div key={m.deger} className="w-[62%] shrink-0 snap-start sm:w-auto sm:shrink">
                <TemaKarti
                  oge={m}
                  aktif={aktifMood === m.deger}
                  onClick={() => setAktifMood((v) => (v === m.deger ? null : m.deger))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        {gosterilecekKurslar.length === 0 ? (
          <p className="font-body text-metin/60">{t("filtreyeUyanDersYok")}</p>
        ) : (
          gosterilecekKurslar.map((k) => (
            <div key={k.id} className="mb-14 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-5">
                <h3 className="font-display text-2xl font-bold text-metin">{k.baslik}</h3>
                <Link
                  href={`/courses/${k.slug}`}
                  className="shrink-0 font-body text-sm text-toprak hover:text-toprak-dark whitespace-nowrap"
                >
                  {t("kursuGoruntule")} →
                </Link>
              </div>
              <div className={dersIzgaraSinifi}>
                {k.dersler.map((d) => (
                  <div key={d.id} className={dersOgeSinifi}>
                    <DersKarti
                      ders={d}
                      kursSlug={k.slug}
                      kursSeviye={k.seviyeEtiket}
                      uyeMi={uyeMi}
                      dkEtiketi={t("dk")}
                      uyeOlEtiketi={t("uyeOl")}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
