import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { guncelUyelik } from "@/lib/uyelik";
import { db } from "@/lib/db";
import HesabimClient from "./HesabimClient";
import ProfilForm from "./ProfilForm";

export const dynamic = "force-dynamic";

const PLAN_ETIKETI: Record<string, string> = { AYLIK: "Aylık", YILLIK: "Yıllık" };
const DURUM_ETIKETI: Record<string, string> = {
  AKTIF: "Aktif",
  IPTAL_EDILDI: "İptal edildi (dönem sonuna kadar erişim devam eder)",
  SUresi_DOLDU: "Süresi doldu",
  BEKLEMEDE: "Ödeme bekleniyor",
};

export default async function Hesabim() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?returnTo=/account");
  // Adminin üye alanına düşmesi istenmiyor — her zaman doğrudan panele gider.
  if (session.user.role === "ADMIN") redirect("/admin");

  const [kullanici, abonelik, izlemeGecmisi] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { ad: true, email: true, telefon: true, profilFotoUrl: true },
    }),
    guncelUyelik(session.user.id),
    db.lessonProgress.findMany({
      where: { userId: session.user.id, tamamlandi: true },
      include: { lesson: { include: { course: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);
  if (!kullanici) redirect("/login?returnTo=/account");

  // "guncelUyelik" statüsü AKTIF/İPTAL_EDİLDİ olan en son kaydı getirir ama
  // dönemin fiilen geçip geçmediğine bakmaz — DB'de hiçbir şey süresi geçince
  // status'ü otomatik "SUresi_DOLDU" yapmıyor (cron yok). Gerçek erişim,
  // her zaman currentPeriodEnd'in şu ana göre kontrolüyle belirlenir — bkz.
  // lib/uyelik.ts > aktifUyelikVarMi (aynı mantık, içerik erişiminde kullanılıyor).
  const erisimVar = !!abonelik && abonelik.currentPeriodEnd > new Date();

  return (
    <div className="container-nefes py-20 max-w-4xl">
      <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu-dark mb-4">Hesabım</p>
      <h1 className="font-display text-4xl font-bold text-metin leading-tight">Merhaba, {kullanici.ad}</h1>

      <div className="mt-10 grid lg:grid-cols-2 gap-6 items-start">
        <section className="border border-cizgi rounded-[1.5rem] p-7 shadow-organik">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu-dark mb-4">Profil</p>
          <ProfilForm
            ad={kullanici.ad}
            email={kullanici.email}
            telefon={kullanici.telefon}
            profilFotoUrl={kullanici.profilFotoUrl}
          />
        </section>

        <section className="border border-cizgi rounded-[1.5rem] p-7 shadow-organik">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu-dark mb-4">Üyelik</p>

          {!erisimVar ? (
            <div>
              <p className="font-body text-metin/70">
                {abonelik ? "Üyeliğinizin süresi doldu." : "Henüz aktif bir üyeliğiniz yok."}
              </p>
              <a
                href="/#membership"
                className="inline-block mt-5 bg-metin text-zemin px-6 py-3 rounded-full font-body text-sm hover:bg-koyu transition-colors"
              >
                Üye ol
              </a>
            </div>
          ) : (
            <div className="font-body text-sm space-y-2.5 text-metin/80">
              <p><span className="text-metin/50">Plan:</span> {PLAN_ETIKETI[abonelik!.plan]}</p>
              <p><span className="text-metin/50">Durum:</span> {DURUM_ETIKETI[abonelik!.status]}</p>
              <p>
                <span className="text-metin/50">
                  {abonelik!.status === "IPTAL_EDILDI" ? "Erişim bitiş tarihi:" : "Yenilenme tarihi:"}
                </span>{" "}
                {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(abonelik!.currentPeriodEnd)}
              </p>

              {abonelik!.status === "AKTIF" && <HesabimClient />}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 border border-cizgi rounded-[1.5rem] p-7 shadow-organik">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu-dark mb-4">İzleme Geçmişi</p>
        {izlemeGecmisi.length === 0 ? (
          <p className="font-body text-sm text-metin/60">Henüz izleme geçmişiniz yok.</p>
        ) : (
          <ul className="font-body text-sm space-y-3">
            {izlemeGecmisi.map((kayit) => (
              <li key={kayit.id} className="flex items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/courses/${kayit.lesson.course.slug}/${kayit.lesson.slug}`}
                    className="text-metin hover:text-vurgu-dark"
                  >
                    {kayit.lesson.baslik}
                  </Link>
                  <p className="text-xs text-metin/45 mt-0.5">{kayit.lesson.course.baslik}</p>
                </div>
                <span className="text-xs text-metin/40 whitespace-nowrap">
                  {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(kayit.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
