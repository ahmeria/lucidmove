import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { aktifUyelikVarMi } from "@/lib/uyelik";
import VideoPlayer from "@/components/VideoPlayer";

export const dynamic = "force-dynamic";

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

  return (
    <div className="container-nefes py-20">
      <div className="max-w-2xl">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-vurgu-dark">
          {kurs.seviye}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-metin mt-3 leading-tight">
          {kurs.baslik}
        </h1>
        <p className="font-body text-metin/70 mt-5 leading-relaxed">{kurs.aciklama}</p>
      </div>

      {kurs.tanitimVideoUrl && (
        <div className="mt-8 max-w-2xl aspect-video bg-koyu rounded-2xl overflow-hidden">
          <VideoPlayer url={kurs.tanitimVideoUrl} poster={kurs.kapakUrl} />
        </div>
      )}

      {!uye && (
        <div className="mt-10 border border-vurgu/40 bg-vurgu/10 rounded-2xl p-6 max-w-2xl flex items-center justify-between gap-4 flex-wrap">
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

      <div className="mt-12 max-w-2xl space-y-3">
        {kurs.lessons.map((ders, i) => {
          const erisilebilir = uye || ders.ucretsizMi;
          return (
            <div
              key={ders.id}
              className="flex items-center justify-between gap-4 border border-cizgi rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-metin/40 w-6">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-body text-metin">{ders.baslik}</p>
                  <p className="font-mono text-xs text-metin/45 mt-0.5">{ders.sureDakika} dk</p>
                </div>
              </div>

              {erisilebilir ? (
                <Link
                  href={`/kurslar/${kurs.slug}/${ders.slug}`}
                  className="font-body text-sm text-vurgu-dark hover:text-metin whitespace-nowrap"
                >
                  İzle →
                </Link>
              ) : (
                <span className="font-mono text-xs text-metin/35 whitespace-nowrap flex items-center gap-1.5">
                  🔒 Üyelere özel
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
