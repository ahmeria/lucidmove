import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SatinAlmaAksiyonlari from "./SatinAlmaAksiyonlari";

export const dynamic = "force-dynamic";

// bkz. app/admin/camps/[id]/reservations/page.tsx — aynı tablo/renk-kodlama
// deseni, yalnızca 2 durumlu (rezervasyon/iptal kavramı yok).
const DURUM_ETIKETI: Record<string, string> = {
  BEKLEMEDE: "Ödeme bekleniyor",
  ODENDI: "Ödendi",
};

const DURUM_RENGI: Record<string, string> = {
  BEKLEMEDE: "bg-amber-100 text-amber-800",
  ODENDI: "bg-emerald-100 text-emerald-800",
};

export default async function OzelDersSatinAlmalari({ params }: { params: { id: string } }) {
  const ders = await db.privateLesson.findUnique({ where: { id: params.id } });
  if (!ders) notFound();

  const satinAlmalar = await db.privateLessonPurchase.findMany({
    where: { privateLessonId: ders.id },
    include: {
      user: { select: { ad: true, email: true, telefon: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <Link href="/admin/private-lessons" className="font-body text-sm text-metin/60 hover:text-metin inline-block">
        ← {ders.baslik}
      </Link>

      {satinAlmalar.length === 0 ? (
        <p className="font-body text-metin/60">Bu özel ders için henüz satın alma yok.</p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Kullanıcı</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Ödeme</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {satinAlmalar.map((s) => (
                <tr key={s.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-metin font-medium">{s.user.ad}</p>
                    <p className="text-metin/50 text-xs">{s.user.email}</p>
                    {s.user.telefon && <p className="text-metin/50 text-xs">{s.user.telefon}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${DURUM_RENGI[s.status] ?? "bg-metin/10 text-metin/60"}`}
                    >
                      {DURUM_ETIKETI[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-metin/60">
                    {s.payments[0] ? `₺${s.payments[0].tutar.toString()} — ${s.payments[0].durum}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {s.status === "BEKLEMEDE" && <SatinAlmaAksiyonlari dersId={ders.id} purchaseId={s.id} />}
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
