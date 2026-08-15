import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { guncelUyelik } from "@/lib/uyelik";
import { db } from "@/lib/db";
import HesabimClient from "./HesabimClient";
import KursIlerlemeKarti from "./KursIlerlemeKarti";

export const dynamic = "force-dynamic";

const PLAN_ETIKETI: Record<string, string> = { AYLIK: "Aylık", YILLIK: "Yıllık" };
const DURUM_ETIKETI: Record<string, string> = {
  AKTIF: "Aktif",
  IPTAL_EDILDI: "İptal edildi (dönem sonuna kadar erişim devam eder)",
  SUresi_DOLDU: "Süresi doldu",
  BEKLEMEDE: "Ödeme bekleniyor",
};

// Üyelik paneli — giriş sonrası iniş sayfası. Profil düzenleme (isim/telefon/
// fotoğraf) artık burada DEĞİL, ayrı bir alt sayfada (bkz. account/profile) —
// buradaki asıl odak kurslar ve izleme gelişimi.
export default async function Hesabim() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?returnTo=/account");
  // Adminin üye alanına düşmesi istenmiyor — her zaman doğrudan panele gider.
  if (session.user.role === "ADMIN") redirect("/admin");

  const [kullanici, abonelik, kurslarHam, tamamlananKayitlar, sonIzlenenler] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { ad: true },
    }),
    guncelUyelik(session.user.id),
    db.course.findMany({
      orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
      include: { lessons: { select: { id: true } } },
    }),
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
  ]);
  if (!kullanici) redirect("/login?returnTo=/account");

  // "guncelUyelik" statüsü AKTIF/İPTAL_EDİLDİ olan en son kaydı getirir ama
  // dönemin fiilen geçip geçmediğine bakmaz — DB'de hiçbir şey süresi geçince
  // status'ü otomatik "SUresi_DOLDU" yapmıyor (cron yok). Gerçek erişim,
  // her zaman currentPeriodEnd'in şu ana göre kontrolüyle belirlenir — bkz.
  // lib/uyelik.ts > aktifUyelikVarMi (aynı mantık, içerik erişiminde kullanılıyor).
  const erisimVar = !!abonelik && abonelik.currentPeriodEnd > new Date();

  const tamamlananSet = new Set(tamamlananKayitlar.map((k) => k.lessonId));
  const kurslar = kurslarHam.map((k) => {
    const toplam = k.lessons.length;
    const tamamlanan = k.lessons.filter((d) => tamamlananSet.has(d.id)).length;
    return { id: k.id, slug: k.slug, baslik: k.baslik, seviye: k.seviye, kapakUrl: k.kapakUrl, toplam, tamamlanan };
  });
  const genelToplam = kurslar.reduce((s, k) => s + k.toplam, 0);
  const genelTamamlanan = kurslar.reduce((s, k) => s + k.tamamlanan, 0);
  const genelYuzde = genelToplam > 0 ? Math.round((genelTamamlanan / genelToplam) * 100) : 0;

  return (
    <div className="container-nefes py-20 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu-dark mb-4">Üyelik Paneli</p>
          <h1 className="font-display text-4xl font-bold text-metin leading-tight">Merhaba, {kullanici.ad}</h1>
        </div>
        <Link
          href="/account/profile"
          className="font-body text-sm text-metin/70 hover:text-metin border border-cizgi rounded-full px-5 py-2.5 hover:border-metin transition-colors whitespace-nowrap"
        >
          Profil ayarları
        </Link>
      </div>

      {/* Üyelik durumu — ince, tek satırlık şerit; artık sayfanın odağı değil */}
      <section className="border border-cizgi rounded-2xl px-6 py-4 shadow-organik mb-6 flex flex-wrap items-center justify-between gap-4">
        {!erisimVar ? (
          <>
            <p className="font-body text-sm text-metin/70">
              {abonelik ? "Üyeliğinizin süresi doldu." : "Henüz aktif bir üyeliğiniz yok."}
            </p>
            <a
              href="/#membership"
              className="bg-metin text-zemin px-5 py-2.5 rounded-full font-body text-sm hover:bg-koyu transition-colors whitespace-nowrap"
            >
              Üye ol
            </a>
          </>
        ) : (
          <>
            <div className="font-body text-sm text-metin/80 flex flex-wrap items-center gap-x-6 gap-y-1.5">
              <span>
                <span className="text-metin/50">Plan:</span> {PLAN_ETIKETI[abonelik!.plan]}
              </span>
              <span>
                <span className="text-metin/50">Durum:</span> {DURUM_ETIKETI[abonelik!.status]}
              </span>
              <span>
                <span className="text-metin/50">
                  {abonelik!.status === "IPTAL_EDILDI" ? "Erişim bitiş tarihi:" : "Yenilenme tarihi:"}
                </span>{" "}
                {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(abonelik!.currentPeriodEnd)}
              </span>
            </div>
            {abonelik!.status === "AKTIF" && <HesabimClient />}
          </>
        )}
      </section>

      {/* Genel gelişim göstergesi */}
      {genelToplam > 0 && (
        <section className="border border-cizgi rounded-[1.5rem] p-7 shadow-organik mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu-dark">Gelişiminiz</p>
            <p className="font-display text-2xl font-bold text-metin">%{genelYuzde}</p>
          </div>
          <div className="h-2.5 bg-zemin rounded-full overflow-hidden">
            <div
              className="h-full bg-vurgu rounded-full transition-[width] duration-500"
              style={{ width: `${genelYuzde}%` }}
            />
          </div>
          <p className="font-body text-xs text-metin/50 mt-2.5">
            {genelTamamlanan} / {genelToplam} ders tamamlandı
          </p>
        </section>
      )}

      {/* Kurslar */}
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu-dark mb-4">Kurslar</p>
        {kurslar.length === 0 ? (
          <p className="font-body text-sm text-metin/60">Henüz kurs eklenmedi.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {kurslar.map((k) => (
              <KursIlerlemeKarti key={k.id} kurs={k} />
            ))}
          </div>
        )}
      </section>

      {/* Son izlenenler — kısa, "kaldığın yerden devam et" amaçlı */}
      {sonIzlenenler.length > 0 && (
        <section className="mt-8 border border-cizgi rounded-[1.5rem] p-7 shadow-organik">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu-dark mb-4">Son İzlenenler</p>
          <ul className="font-body text-sm space-y-3">
            {sonIzlenenler.map((kayit) => (
              <li key={kayit.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/courses/${kayit.lesson.course.slug}/${kayit.lesson.slug}`}
                    className="text-metin hover:text-vurgu-dark truncate block"
                  >
                    {kayit.lesson.baslik}
                  </Link>
                  <p className="text-xs text-metin/45 mt-0.5 truncate">{kayit.lesson.course.baslik}</p>
                </div>
                <span className="text-xs text-metin/40 whitespace-nowrap shrink-0">
                  {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(kayit.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
