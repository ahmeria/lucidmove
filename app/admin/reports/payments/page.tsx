import { db } from "@/lib/db";
import { ayAraligi, ayEtiketi, gosterilecekAy } from "@/lib/ayFiltresi";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import RaporlarSekmeleri from "../RaporlarSekmeleri";
import AyFiltresi from "@/components/admin/AyFiltresi";

export const dynamic = "force-dynamic";

const SAYFA_BOYUTU = 40;

const DURUM_ETIKETI: Record<string, string> = { BASARILI: "Başarılı", BASARISIZ: "Başarısız", BEKLEMEDE: "Bekliyor" };
const DURUM_RENGI: Record<string, string> = {
  BASARILI: "bg-emerald-100 text-emerald-800",
  BASARISIZ: "bg-hata/10 text-hata",
  BEKLEMEDE: "bg-amber-100 text-amber-800",
};

// Üyelikler sayfası (bkz. /admin/subscriptions) her abonelik için yalnızca SON
// ödemeyi gösterir — burası her ödeme denemesinin tam geçmişi (başarısız/
// bekleyen denemeler dahil). Ay filtresi ödeme tarihine (createdAt) göre süzer.
export default async function AdminRaporlarOdemeler({
  searchParams,
}: {
  searchParams: { sayfa?: string; ay?: string };
}) {
  const sayfa = Math.max(1, Number(searchParams.sayfa) || 1);
  const araligi = ayAraligi(searchParams.ay);
  const donemEtiketi = ayEtiketi(gosterilecekAy(searchParams.ay));
  const where = araligi ? { createdAt: araligi } : {};

  function sayfaUrl(hedefSayfa: number) {
    const params = new URLSearchParams();
    if (searchParams.ay) params.set("ay", searchParams.ay);
    params.set("sayfa", String(hedefSayfa));
    return `/admin/reports/payments?${params.toString()}`;
  }

  const [odemeler, toplam] = await Promise.all([
    db.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYUTU,
      take: SAYFA_BOYUTU,
      include: { user: { select: { ad: true, email: true } } },
    }),
    db.payment.count({ where }),
  ]);
  const sonSayfa = Math.max(1, Math.ceil(toplam / SAYFA_BOYUTU));

  return (
    <div>
      <SayfaBasligi
        sag={
          <div className="flex items-center gap-3">
            <AyFiltresi />
            <RaporlarSekmeleri />
          </div>
        }
      />

      {odemeler.length === 0 ? (
        <p className="font-body text-metin/60">
          {araligi ? `${donemEtiketi} içinde ödeme kaydı yok.` : "Henüz ödeme kaydı yok."}
        </p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Üye</th>
                <th className="px-5 py-3">Tutar</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Iyzico Payment ID</th>
                <th className="px-5 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {odemeler.map((o) => (
                <tr key={o.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-metin font-medium">{o.user.ad}</p>
                    <p className="text-metin/50 text-xs">{o.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-metin/70">
                    {o.paraBirimi === "TRY" ? "₺" : o.paraBirimi + " "}
                    {Number(o.tutar).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${DURUM_RENGI[o.durum] ?? "bg-metin/10 text-metin/60"}`}>
                      {DURUM_ETIKETI[o.durum] ?? o.durum}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-metin/45 font-mono text-xs">{o.iyzicoPaymentId ?? "—"}</td>
                  <td className="px-5 py-3 text-metin/60">
                    {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(o.createdAt)}
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
              <a href={sayfaUrl(sayfa - 1)} className="text-vurgu hover:text-vurgu-dark">
                ← Önceki
              </a>
            )}
            {sayfa < sonSayfa && (
              <a href={sayfaUrl(sayfa + 1)} className="text-vurgu hover:text-vurgu-dark">
                Sonraki →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
