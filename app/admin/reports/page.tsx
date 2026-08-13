import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import RaporlarSekmeleri from "./RaporlarSekmeleri";

export const dynamic = "force-dynamic";

function uyelikDurumunuAl(abonelik: { status: string; currentPeriodEnd: Date } | undefined) {
  if (!abonelik) return { metin: "Üyeliksiz", sinif: "bg-metin/10 text-metin/50" };
  if (abonelik.currentPeriodEnd <= new Date()) return { metin: "Süresi doldu", sinif: "bg-metin/10 text-metin/50" };
  if (abonelik.status === "BEKLEMEDE") return { metin: "Ödeme bekleniyor", sinif: "bg-amber-100 text-amber-800" };
  if (abonelik.status === "IPTAL_EDILDI") return { metin: "İptal edildi", sinif: "bg-amber-100 text-amber-800" };
  return { metin: "Aktif", sinif: "bg-emerald-100 text-emerald-800" };
}

// Kullanıcı raporu — her üyenin kayıt, üyelik durumu, ödeme ve izlenme
// (tamamlanan ders) özetini tek satırda gösterir. İzlenme ve ödeme
// DETAYLARI için bkz. sekme şeridindeki diğer iki rapor.
export default async function AdminRaporlarKullanicilar() {
  const [kullanicilar, izlenmeSayilari] = await Promise.all([
    db.user.findMany({
      where: { role: "UYE" },
      orderBy: { createdAt: "desc" },
      include: {
        payments: { where: { durum: "BASARILI" }, select: { tutar: true } },
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    db.lessonProgress.groupBy({ by: ["userId"], where: { tamamlandi: true }, _count: { _all: true } }),
  ]);

  const izlenmeMap = new Map(izlenmeSayilari.map((i) => [i.userId, i._count._all]));

  return (
    <div>
      <SayfaBasligi sag={<RaporlarSekmeleri />} />

      {kullanicilar.length === 0 ? (
        <p className="font-body text-metin/60">Henüz kayıtlı üye yok.</p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Üye</th>
                <th className="px-5 py-3">Kayıt</th>
                <th className="px-5 py-3">Üyelik durumu</th>
                <th className="px-5 py-3">Toplam ödeme</th>
                <th className="px-5 py-3">Tamamlanan ders</th>
              </tr>
            </thead>
            <tbody>
              {kullanicilar.map((k) => {
                const durum = uyelikDurumunuAl(k.subscriptions[0]);
                const toplamOdeme = k.payments.reduce((t, p) => t + Number(p.tutar), 0);
                return (
                  <tr key={k.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-metin font-medium">{k.ad}</p>
                      <p className="text-metin/50 text-xs">{k.email}</p>
                    </td>
                    <td className="px-5 py-3 text-metin/60">
                      {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(k.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${durum.sinif}`}>
                        {durum.metin}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-metin/60">
                      {toplamOdeme > 0 ? `₺${toplamOdeme.toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-metin/60">{izlenmeMap.get(k.id) ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Kart>
      )}
    </div>
  );
}
