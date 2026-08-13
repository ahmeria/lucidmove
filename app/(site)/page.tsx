import Link from "next/link";
import Image from "next/image";
import MembershipClient from "@/app/(site)/membership/MembershipClient";
import Canlandir from "@/components/Canlandir";
import { db } from "@/lib/db";
import {
  getSiteSettings,
  getInstructorProfile,
  getGaleriGorselleri,
  satirlaraAyir,
  paragraflaraAyir,
  formatFiyat,
} from "@/lib/settings";

// "Nefesinizin *hızında* bir yoga pratiği." -> yıldızlar arasındaki kısım vurgulanır.
function VurgulaYildiz({ metin }: { metin: string }) {
  const parcalar = metin.split(/\*(.+?)\*/);
  return (
    <>
      {parcalar.map((parca, i) =>
        i % 2 === 1 ? (
          <em key={i} className="not-italic text-vurgu">
            {parca}
          </em>
        ) : (
          <span key={i}>{parca}</span>
        )
      )}
    </>
  );
}

export default async function Anasayfa({ searchParams }: { searchParams: { durum?: string } }) {
  const [ayarlar, egitmen, galeriGorselleri, planlar, kategoriler, kategorisizKurslar, yorumlar] = await Promise.all([
    getSiteSettings(),
    getInstructorProfile(),
    getGaleriGorselleri(),
    db.pricingPlan.findMany({ orderBy: { sira: "asc" } }),
    db.category.findMany({
      orderBy: { sira: "asc" },
      include: {
        courses: {
          orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
          include: { _count: { select: { lessons: true } } },
        },
      },
    }),
    db.course.findMany({
      where: { categoryId: null },
      orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { lessons: true } } },
    }),
    db.testimonial.findMany({ orderBy: [{ sira: "asc" }, { createdAt: "asc" }] }),
  ]);

  const bioParagraflari = paragraflaraAyir(egitmen.bio);
  const sertifikalar = satirlaraAyir(egitmen.sertifikalar);
  const yaklasim = satirlaraAyir(egitmen.yaklasim);
  const instagramHandle = "@" + ayarlar.instagramUrl.replace(/\/$/, "").split("/").pop();

  const kursGruplari = [
    ...kategoriler.filter((k) => k.courses.length > 0).map((k) => ({ baslik: k.ad, kurslar: k.courses })),
    ...(kategorisizKurslar.length > 0 ? [{ baslik: "Diğer", kurslar: kategorisizKurslar }] : []),
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
        <Image
          src={ayarlar.heroGorselUrl}
          alt="Yoga pratiği yapan bir kadın"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/50" />

        <div className="relative h-full container-nefes flex flex-col justify-end pb-16 sm:pb-24">
          <div className="max-w-xl animate-riseIn">
            <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.08] text-white">
              <VurgulaYildiz metin={ayarlar.heroBaslik} />
            </h1>
            <p className="font-body text-base sm:text-lg text-white/80 mt-5 max-w-md leading-relaxed">
              {ayarlar.heroAltBaslik}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Link
                href="#membership"
                className="bg-koyu text-white px-7 py-3.5 rounded-full font-body text-sm hover:bg-koyu/80 transition-colors inline-flex items-center gap-2"
              >
                {ayarlar.heroCtaBirincil} <span aria-hidden>→</span>
              </Link>
              <Link
                href="#courses"
                className="bg-zemin/90 text-metin px-6 py-3 rounded-full font-body text-sm hover:bg-zemin transition-colors"
              >
                {ayarlar.heroCtaIkincil}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ÜYELİK / FİYATLANDIRMA */}
      {/* Not: bölüm koşulsuz render edilir (yalnızca içerik dallanır) — aksi halde
          admin tüm planları silerse "#membership" çapası DOM'dan kaybolur ve navbar/footer/
          hero'daki tüm "#membership" linkleri sessizce hiçbir yere gitmez. */}
      <section id="membership" className="container-nefes py-24 scroll-mt-20">
        <Canlandir className="text-center max-w-xl mx-auto mb-12">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-3">{ayarlar.uyelikEyebrow}</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-metin">{ayarlar.uyelikBaslik}</h2>
          <p className="font-body text-metin/70 mt-3">{ayarlar.uyelikAltBaslik}</p>
        </Canlandir>

        {planlar.length === 0 ? (
          <p className="font-body text-metin/60 text-center">Şu anda tanımlı bir üyelik planı yok.</p>
        ) : (
          <Canlandir gecikme={100}>
            <MembershipClient
              baslangicDurum={searchParams.durum}
              planlar={planlar.map((p) => ({
                plan: p.plan,
                baslik: p.baslik,
                fiyat: formatFiyat(p.fiyat.toNumber(), ayarlar),
                periyot: p.periyot,
                aciklama: p.aciklama,
                ozellikler: satirlaraAyir(p.ozellikler),
                rozet: p.rozet,
                vurgulu: p.vurgulu,
              }))}
            />
          </Canlandir>
        )}
      </section>

      {/* KURSLAR */}
      <section id="courses" className="relative container-nefes py-24 scroll-mt-20 overflow-hidden">
        <div className="blob w-[380px] h-[380px] bg-vurgu/10 top-0 right-0" />

        <Canlandir className="relative text-center max-w-xl mx-auto mb-14">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-3">Kütüphane</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-metin">Kurslar</h2>
          <p className="font-body text-metin/70 mt-3">
            Her kurs, tek bir temaya odaklanan bir ders serisidir. Üyeler tüm derslere sınırsız erişebilir; her
            kursta bir tanıtım dersi ücretsizdir.
          </p>
        </Canlandir>

        {kursGruplari.length === 0 ? (
          <p className="relative font-body text-metin/60 text-center">Henüz kurs eklenmedi.</p>
        ) : (
          <div className="relative space-y-16">
            {kursGruplari.map((grup) => (
              <div key={grup.baslik}>
                <h3 className="font-display text-xl font-bold text-metin mb-6">{grup.baslik}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grup.kurslar.map((k, i) => (
                    <Canlandir key={k.id} gecikme={(i % 3) * 80}>
                      <Link
                        href={`/courses/${k.slug}`}
                        className="group block bg-kart border border-cizgi rounded-[1.5rem] overflow-hidden shadow-organik hover:shadow-organik-hover hover:border-ikincil transition-all"
                      >
                        {k.kapakUrl && (
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                              src={k.kapakUrl}
                              alt={k.baslik}
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <span className="font-mono text-xs text-ikincil-dark">{k.seviye}</span>
                          <h4 className="font-display text-xl font-bold text-metin mt-3">{k.baslik}</h4>
                          <p className="font-body text-sm text-metin/60 mt-2 line-clamp-2">{k.aciklama}</p>
                          <p className="font-body text-xs text-metin/45 mt-4">{k._count.lessons} ders</p>
                        </div>
                      </Link>
                    </Canlandir>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* GALERİ — admin panelden yönetilir (bkz. app/admin/settings/page-design) */}
      {galeriGorselleri.length > 0 && (
        <section className="container-nefes pb-24">
          <Canlandir className="text-center max-w-xl mx-auto mb-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-3">Stüdyodan kareler</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-metin">Pratiğin içinden</h2>
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
                  alt={g.alt || "Stüdyodan bir kare"}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </Canlandir>
            ))}
          </div>
        </section>
      )}

      {/* HAKKIMDA */}
      <section id="about" className="bg-koyu text-zemin scroll-mt-20">
        <div className="container-nefes py-24 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
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
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-4">Eğitmen</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">Merhaba, ben {egitmen.ad}.</h2>
            <div className="font-body text-zemin/75 mt-6 space-y-5 leading-relaxed max-w-xl">
              {bioParagraflari.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              <div className="bg-zemin/5 border border-zemin/15 rounded-[1.5rem] p-6">
                <p className="font-mono text-xs text-vurgu uppercase tracking-[0.2em]">Sertifikalar</p>
                <ul className="font-body text-sm text-zemin/80 mt-3 space-y-1.5">
                  {sertifikalar.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-zemin/5 border border-zemin/15 rounded-[1.5rem] p-6">
                <p className="font-mono text-xs text-vurgu uppercase tracking-[0.2em]">Yaklaşım</p>
                <ul className="font-body text-sm text-zemin/80 mt-3 space-y-1.5">
                  {yaklasim.map((y, i) => (
                    <li key={i}>{y}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 mt-10">
              <Link
                href="#membership"
                className="inline-block bg-vurgu text-white px-7 py-3.5 rounded-full font-body text-sm hover:bg-vurgu-dark transition-colors"
              >
                Derslerime katılın
              </Link>
              <Link
                href={ayarlar.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-zemin/70 hover:text-zemin border-b border-zemin/30 hover:border-zemin transition-colors"
              >
                {instagramHandle} →
              </Link>
            </div>
          </Canlandir>
        </div>
      </section>

      {/* YORUMLAR — admin panelden yönetilir (bkz. app/admin/testimonials). Kart
          genişlikleri, üçten fazla kayıt olduğunda şeridin doğal olarak
          yatayda kaydırılabilir hale gelmesi için sabitlenmiş durumda. */}
      {yorumlar.length > 0 && (
        <section className="relative container-nefes py-24 overflow-hidden">
          <div className="blob w-[380px] h-[380px] bg-ikincil/10 top-0 right-0" />
          <Canlandir className="relative text-center max-w-xl mx-auto mb-14">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-3">Üyelerimiz ne diyor</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-metin">Pratikleriyle değişenler</h2>
          </Canlandir>

          <div className="relative flex gap-6 overflow-x-auto snap-x snap-mandatory kaydirma-cubugu-gizli -mx-6 px-6 sm:mx-0 sm:px-0">
            {yorumlar.map((y, i) => (
              <Canlandir
                key={y.id}
                gecikme={i * 90}
                className="shrink-0 snap-start w-[85vw] sm:w-[calc((100%-3rem)/3)] bg-kart border border-cizgi rounded-[1.5rem] p-7 shadow-organik"
              >
                <p className="font-display text-vurgu text-3xl leading-none mb-3">&ldquo;</p>
                <p className="font-body text-sm text-metin/75 leading-relaxed">{y.yorum}</p>
                <p className="font-body text-sm text-metin mt-6 font-medium">{y.isim}</p>
                <p className="font-mono text-xs text-metin/45">{y.rol}</p>
              </Canlandir>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
