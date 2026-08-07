import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import IptalButonu from "./IptalButonu";

export const dynamic = "force-dynamic";

const DURUM_ETIKETI: Record<string, string> = {
  AKTIF: "Aktif",
  IPTAL_EDILDI: "İptal edildi",
  SUresi_DOLDU: "Süresi doldu",
  BEKLEMEDE: "Ödeme bekleniyor",
};

const PLAN_ETIKETI: Record<string, string> = { AYLIK: "Aylık", YILLIK: "Yıllık" };

const DURUM_RENGI: Record<string, string> = {
  AKTIF: "bg-emerald-100 text-emerald-800",
  IPTAL_EDILDI: "bg-hata/10 text-hata",
  SUresi_DOLDU: "bg-metin/10 text-metin/60",
  BEKLEMEDE: "bg-amber-100 text-amber-800",
};

export default async function AdminUyelikler() {
  const abonelikler = await db.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { ad: true, email: true, telefon: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      {abonelikler.length === 0 ? (
        <p className="font-body text-metin/60">Henüz abonelik yok.</p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Kullanıcı</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Dönem sonu</th>
                <th className="px-5 py-3">Son ödeme</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {abonelikler.map((a) => (
                <tr key={a.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-metin font-medium">{a.user.ad}</p>
                    <p className="text-metin/50 text-xs">{a.user.email}</p>
                    {a.user.telefon && <p className="text-metin/50 text-xs">{a.user.telefon}</p>}
                  </td>
                  <td className="px-5 py-3 text-metin/70">{PLAN_ETIKETI[a.plan] ?? a.plan}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${DURUM_RENGI[a.status] ?? "bg-metin/10 text-metin/60"}`}>
                      {DURUM_ETIKETI[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-metin/60">
                    {new Date(a.currentPeriodEnd).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-3 text-metin/60">
                    {a.payments[0] ? `₺${a.payments[0].tutar.toString()} — ${a.payments[0].durum}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {a.status === "AKTIF" && <IptalButonu abonelikId={a.id} kullaniciAdi={a.user.ad} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Kart>
      )}
    </div>
  );
}
