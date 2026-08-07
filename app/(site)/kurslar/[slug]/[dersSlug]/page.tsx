import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { aktifUyelikVarMi } from "@/lib/uyelik";
import VideoPlayer from "@/components/VideoPlayer";

export const dynamic = "force-dynamic";

export default async function DersDetay({
  params,
}: {
  params: { slug: string; dersSlug: string };
}) {
  const kurs = await db.course.findUnique({
    where: { slug: params.slug },
    include: { lessons: { orderBy: { sira: "asc" } } },
  });
  if (!kurs) notFound();

  const ders = kurs.lessons.find((d) => d.slug === params.dersSlug);
  if (!ders) notFound();

  const session = await getServerSession(authOptions);
  const uye = await aktifUyelikVarMi(session?.user?.id);

  // Giriş yapmış ama üyeliği yok/süresi dolmuş bir kullanıcı (admin hariç)
  // içerik sayfalarından hangisine girerse girsin doğrudan hesabım'a
  // yönlendirilir — bkz. app/kurslar/[slug]/page.tsx.
  if (session?.user?.id && session.user.role !== "ADMIN" && !uye) {
    redirect("/hesabim");
  }

  const erisilebilir = uye || ders.ucretsizMi;
  if (!erisilebilir) {
    redirect(`/kurslar/${kurs.slug}?durum=uyelik-gerekli`);
  }

  const guncelIndex = kurs.lessons.findIndex((d) => d.slug === ders.slug);
  const sonrakiDers = kurs.lessons[guncelIndex + 1];

  return (
    <div className="container-nefes py-16 max-w-3xl">
      <Link href={`/kurslar/${kurs.slug}`} className="font-body text-sm text-metin/60 hover:text-metin">
        ← {kurs.baslik}
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-metin mt-4">{ders.baslik}</h1>
      <p className="font-mono text-xs text-metin/45 mt-2">{ders.sureDakika} dk</p>

      <div className="mt-8 aspect-video bg-koyu rounded-2xl overflow-hidden">
        {/*
          Yerel yüklenen dosyalar sunucudan doğrudan servis edilir; YouTube
          linkleri gömülü oynatıcıyla gösterilir. Üretimde büyük ölçekli bir
          kütüphane için Mux/Cloudflare Stream/Bunny Stream gibi imzalı-URL
          veren bir servise geçmek isteyebilirsiniz.
        */}
        {ders.videoUrl ? (
          <VideoPlayer url={ders.videoUrl} poster={kurs.kapakUrl} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center px-6">
            <p className="font-body text-sm text-zemin/70">
              {ders.filigranDurumu === "HATA"
                ? "Video işlenirken bir sorun oluştu. Lütfen bizimle iletişime geçin."
                : "Video hazırlanıyor, birazdan tekrar deneyin."}
            </p>
          </div>
        )}
      </div>

      {sonrakiDers && (
        <div className="mt-8 flex justify-end">
          <Link
            href={`/kurslar/${kurs.slug}/${sonrakiDers.slug}`}
            className="font-body text-sm text-metin bg-cizgi/60 hover:bg-cizgi px-5 py-2.5 rounded-full transition-colors"
          >
            Sonraki ders: {sonrakiDers.baslik} →
          </Link>
        </div>
      )}
    </div>
  );
}
