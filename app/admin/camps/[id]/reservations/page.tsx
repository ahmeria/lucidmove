import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { suresiGecenRezervasyonlariGuncelle } from "@/lib/kamplar";
import Kart from "@/components/admin/Kart";
import RezervasyonAksiyonlari from "./RezervasyonAksiyonlari";

export const dynamic = "force-dynamic";

// bkz. app/admin/subscriptions/page.tsx — aynı tablo/renk-kodlama deseni.
const DURUM_ETIKETI: Record<string, string> = {
  REZERVE_EDILDI: "Ödeme bekleniyor",
  ODENDI: "Ödendi",
  SURESI_DOLDU: "Süresi doldu",
  IPTAL_EDILDI: "İptal edildi",
};

const DURUM_RENGI: Record<string, string> = {
  REZERVE_EDILDI: "bg-amber-100 text-amber-800",
  ODENDI: "bg-emerald-100 text-emerald-800",
  SURESI_DOLDU: "bg-metin/10 text-metin/60",
  IPTAL_EDILDI: "bg-hata/10 text-hata",
};

export default async function KampRezervasyonlari({ params }: { params: { id: string } }) {
  const kamp = await db.camp.findUnique({ where: { id: params.id } });
  if (!kamp) notFound();

  await suresiGecenRezervasyonlariGuncelle(kamp.id);

  const rezervasyonlar = await db.campReservation.findMany({
    where: { campId: kamp.id },
    include: {
      user: { select: { ad: true, email: true, telefon: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <Link href="/admin/camps" className="font-body text-sm text-metin/60 hover:text-metin inline-block">
        ← {kamp.ad}
      </Link>

      {rezervasyonlar.length === 0 ? (
        <p className="font-body text-metin/60">Bu kamp için henüz rezervasyon/satın alma yok.</p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Kullanıcı</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Son ödeme tarihi</th>
                <th className="px-5 py-3">Ödeme</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rezervasyonlar.map((r) => (
                <tr key={r.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-metin font-medium">{r.user.ad}</p>
                    <p className="text-metin/50 text-xs">{r.user.email}</p>
                    {r.user.telefon && <p className="text-metin/50 text-xs">{r.user.telefon}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${DURUM_RENGI[r.status] ?? "bg-metin/10 text-metin/60"}`}
                    >
                      {DURUM_ETIKETI[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-metin/60">{new Date(r.sonOdemeTarihi).toLocaleString("tr-TR")}</td>
                  <td className="px-5 py-3 text-metin/60">
                    {r.payments[0] ? `₺${r.payments[0].tutar.toString()} — ${r.payments[0].durum}` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {r.status === "REZERVE_EDILDI" && (
                      <RezervasyonAksiyonlari campId={kamp.id} reservationId={r.id} kullaniciAdi={r.user.ad} />
                    )}
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
