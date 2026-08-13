import Link from "next/link";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";

export const dynamic = "force-dynamic";

// Satın alma geçmişi olan (en az bir Subscription kaydı olan) tüm ÜYE
// rolündeki hesapların listesi — admin hesapları hiçbir zaman görünmez
// (role: "UYE" filtresi). "Üyelikler" (bkz. /admin/uyelikler) her abonelik
// kaydını ayrı bir satır olarak gösterirken, burası kişi başına tek satır —
// her üyenin GÜNCEL durumunu özetler.
export default async function AdminUyeler() {
  const uyeler = await db.user.findMany({
    where: { role: "UYE", subscriptions: { some: {} } },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { payments: { where: { durum: "BASARILI" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const simdi = new Date();

  function durumBilgisiAl(abonelik: (typeof uyeler)[number]["subscriptions"][number] | undefined) {
    if (!abonelik) return { metin: "Üyeliksiz", sinif: "bg-metin/10 text-metin/50" };
    if (abonelik.status === "BEKLEMEDE") return { metin: "Ödeme bekleniyor", sinif: "bg-amber-100 text-amber-800" };
    // Süre dolmuş mu, DB'deki statik status alanından değil canlı tarih
    // karşılaştırmasından belirlenir (bkz. lib/uyelik.ts > aktifUyelikVarMi
    // ile aynı desen) — bir arka plan job'ı status'ü otomatik çevirmiyor.
    if (abonelik.currentPeriodEnd <= simdi) return { metin: "Süresi doldu", sinif: "bg-metin/10 text-metin/50" };
    if (abonelik.status === "IPTAL_EDILDI") return { metin: "İptal edildi", sinif: "bg-amber-100 text-amber-800" };
    return { metin: "Aktif", sinif: "bg-emerald-100 text-emerald-800" };
  }

  const PLAN_ETIKETI: Record<string, string> = { AYLIK: "Aylık", YILLIK: "Yıllık" };

  return (
    <div>
      <SayfaBasligi
        sag={
          <Link
            href="/admin/uyeler/yeni"
            className="bg-metin text-zemin px-5 py-2.5 rounded-lg font-body text-sm hover:bg-koyu transition-colors cursor-pointer whitespace-nowrap"
          >
            Yeni üye ekle
          </Link>
        }
      />

      {uyeler.length === 0 ? (
        <p className="font-body text-metin/60">Henüz satın alım yapan üye yok.</p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Üye</th>
                <th className="px-5 py-3">Kayıt</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Dönem sonu</th>
                <th className="px-5 py-3">Başarılı ödeme</th>
              </tr>
            </thead>
            <tbody>
              {uyeler.map((u) => {
                const guncelAbonelik = u.subscriptions[0];
                const durum = durumBilgisiAl(guncelAbonelik);
                return (
                  <tr key={u.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-metin font-medium">{u.ad}</p>
                      <p className="text-metin/50 text-xs">{u.email}</p>
                      {u.telefon && <p className="text-metin/50 text-xs">{u.telefon}</p>}
                    </td>
                    <td className="px-5 py-3 text-metin/60">
                      {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(u.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-metin/70">
                      {guncelAbonelik ? PLAN_ETIKETI[guncelAbonelik.plan] ?? guncelAbonelik.plan : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${durum.sinif}`}>
                        {durum.metin}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-metin/60">
                      {guncelAbonelik ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(guncelAbonelik.currentPeriodEnd) : "—"}
                    </td>
                    <td className="px-5 py-3 text-metin/60">{u._count.payments}</td>
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
