import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { aktifUyelikVarMi } from "@/lib/uyelik";
import VideoPlayer from "@/components/VideoPlayer";

export const dynamic = "force-dynamic";

function KilitIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" strokeLinecap="round" />
    </svg>
  );
}

export default async function KursDetay({ params }: { params: { slug: string } }) {
  const kurs = await db.course.findUnique({
    where: { slug: params.slug },
    include: { lessons: { orderBy: { sira: "asc" } } },
  });

  if (!kurs) notFound();

  const session = await getServerSession(authOptions);
  const uye = await aktifUyelikVarMi(session?.user?.id);

  // Giriş yapmış ama üyeliği yok/süresi dolmuş bir kullanıcı (admin hariç)
  // içerik sayfalarından hangisine girerse girsin doğrudan hesabım'a
  // yönlendirilir — orada üyeliğini yenileyebilir. Anonim ziyaretçiler
  // (session yok) kursu tanıtım amaçlı görmeye devam edebilir.
  if (session?.user?.id && session.user.role !== "ADMIN" && !uye) {
    redirect("/hesabim");
  }

  const toplamDakika = kurs.lessons.reduce((t, d) => t + d.sureDakika, 0);

  return (
    <div>
      {/* HERO — kapak görseli/tanıtım videosu artık her zaman görünür, konu
          bilgisi ve görsel tam genişlikteki bir iki-sütun yerleşimini paylaşır. */}
      <section className="container-nefes pt-14 sm:pt-20 pb-20">
        <Link
          href="/#kurslar"
          className="font-mono text-xs text-metin/50 hover:text-metin transition-colors inline-flex items-center gap-1.5 mb-8"
        >
          ← Tüm kurslar
        </Link>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-vurgu-dark">{kurs.seviye}</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-metin mt-3 leading-tight">
              {kurs.baslik}
            </h1>
            <p className="font-body text-metin/70 mt-5 leading-relaxed">{kurs.aciklama}</p>

            <div className="flex items-center gap-4 mt-6 font-mono text-xs text-metin/50 uppercase tracking-wide">
              <span>{kurs.lessons.length} ders</span>
              <span className="size-1 rounded-full bg-metin/25" />
              <span>{toplamDakika} dk toplam</span>
            </div>

            {!uye && (
              <div className="mt-8 border border-vurgu/40 bg-vurgu/10 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
                <p className="font-body text-sm text-metin/80">
                  Bu kursun tamamına erişmek için bir üyelik gerekir. Tanıtım dersini
                  ücretsiz izleyebilirsiniz.
                </p>
                <Link
                  href="/#uyelik"
                  className="bg-metin text-zemin px-6 py-3 rounded-full font-body text-sm whitespace-nowrap hover:bg-koyu transition-colors"
                >
                  Üye ol
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
                alt={kurs.baslik}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* AKIŞ — dersler, her birini bir öncekine bağlayan ince bir çizgiyle
          "akış" fikrini görsel olarak da taşıyan dikey bir şerit halinde. */}
      <section className="container-nefes pb-24">
        <h2 className="font-display text-2xl font-bold text-metin mb-8">Ders Akışı</h2>

        <div>
          {kurs.lessons.map((ders, i) => {
            const erisilebilir = uye || ders.ucretsizMi;
            const sonuncu = i === kurs.lessons.length - 1;

            const icerik = (
              <>
                <div>
                  <p className="font-body text-metin font-medium">{ders.baslik}</p>
                  <p className="font-mono text-xs text-metin/45 mt-1">
                    {ders.sureDakika} dk{ders.ucretsizMi ? " · Ücretsiz tanıtım" : ""}
                  </p>
                </div>
                {erisilebilir ? (
                  <span className="font-body text-sm text-vurgu-dark group-hover:text-metin transition-colors whitespace-nowrap">
                    İzle →
                  </span>
                ) : (
                  <span className="font-mono text-xs text-metin/35 whitespace-nowrap flex items-center gap-1.5">
                    <KilitIkonu className="size-3.5" /> Üyelere özel
                  </span>
                )}
              </>
            );

            return (
              <div key={ders.id} className="flex gap-5">
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className={`flex items-center justify-center size-10 rounded-full font-mono text-xs shrink-0 transition-colors ${
                      erisilebilir ? "bg-vurgu text-white" : "bg-cizgi text-metin/40"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {!sonuncu && <span className="w-px flex-1 bg-cizgi my-1" />}
                </div>

                {erisilebilir ? (
                  <Link
                    href={`/kurslar/${kurs.slug}/${ders.slug}`}
                    className="group flex-1 mb-4 flex items-center justify-between gap-4 bg-kart border border-cizgi rounded-2xl px-6 py-5 hover:border-ikincil hover:shadow-organik transition-all"
                  >
                    {icerik}
                  </Link>
                ) : (
                  <div className="flex-1 mb-4 flex items-center justify-between gap-4 bg-kart/60 border border-cizgi rounded-2xl px-6 py-5">
                    {icerik}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
