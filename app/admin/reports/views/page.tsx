import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import RaporlarSekmeleri from "../RaporlarSekmeleri";

export const dynamic = "force-dynamic";

const SAYFA_BOYUTU = 40;

// Bir ders videosu sonuna kadar izlendiğinde (bkz. components/VideoPlayer.tsx
// > onEnded, app/api/membership/watch) burada bir satır olarak görünür.
export default async function AdminRaporlarIzlenmeler({
  searchParams,
}: {
  searchParams: { sayfa?: string };
}) {
  const sayfa = Math.max(1, Number(searchParams.sayfa) || 1);

  const [kayitlar, toplam] = await Promise.all([
    db.lessonProgress.findMany({
      where: { tamamlandi: true },
      orderBy: { updatedAt: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYUTU,
      take: SAYFA_BOYUTU,
      include: {
        user: { select: { ad: true, email: true } },
        lesson: { select: { baslik: true, course: { select: { baslik: true } } } },
      },
    }),
    db.lessonProgress.count({ where: { tamamlandi: true } }),
  ]);
  const sonSayfa = Math.max(1, Math.ceil(toplam / SAYFA_BOYUTU));

  return (
    <div>
      <SayfaBasligi sag={<RaporlarSekmeleri />} />

      {kayitlar.length === 0 ? (
        <p className="font-body text-metin/60">
          Henüz tamamlanan ders yok. Bir üye bir ders videosunu sonuna kadar izlediğinde burada görünür.
        </p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Üye</th>
                <th className="px-5 py-3">Kurs</th>
                <th className="px-5 py-3">Ders</th>
                <th className="px-5 py-3">Tamamlanma</th>
              </tr>
            </thead>
            <tbody>
              {kayitlar.map((k) => (
                <tr key={k.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-metin font-medium">{k.user.ad}</p>
                    <p className="text-metin/50 text-xs">{k.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-metin/70">{k.lesson.course.baslik}</td>
                  <td className="px-5 py-3 text-metin/70">{k.lesson.baslik}</td>
                  <td className="px-5 py-3 text-metin/60">
                    {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(k.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Kart>
      )}

      {sonSayfa > 1 && (
        <div className="flex items-center justify-between mt-6 font-body text-sm text-metin/60">
          <p>
            Sayfa {sayfa} / {sonSayfa} — {toplam} kayıt
          </p>
          <div className="flex gap-3">
            {sayfa > 1 && (
              <a href={`/admin/reports/views?sayfa=${sayfa - 1}`} className="text-vurgu hover:text-vurgu-dark">
                ← Önceki
              </a>
            )}
            {sayfa < sonSayfa && (
              <a href={`/admin/reports/views?sayfa=${sayfa + 1}`} className="text-vurgu hover:text-vurgu-dark">
                Sonraki →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
