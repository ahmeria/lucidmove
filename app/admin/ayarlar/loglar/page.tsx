import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import Kart from "@/components/admin/Kart";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import LoglarFiltre from "./LoglarFiltre";

export const dynamic = "force-dynamic";

const SAYFA_BOYUTU = 30;

export default async function AdminLoglar({
  searchParams,
}: {
  searchParams: { kategori?: string; seviye?: string; sayfa?: string };
}) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const sayfa = Math.max(1, Number(searchParams.sayfa) || 1);
  const where: Prisma.SystemLogWhereInput = {};
  if (searchParams.kategori) where.kategori = searchParams.kategori;
  if (searchParams.seviye) where.seviye = searchParams.seviye;

  const [loglar, toplam] = await Promise.all([
    db.systemLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYUTU,
      take: SAYFA_BOYUTU,
    }),
    db.systemLog.count({ where }),
  ]);
  const sonSayfa = Math.max(1, Math.ceil(toplam / SAYFA_BOYUTU));

  function sayfaUrl(hedefSayfa: number) {
    const params = new URLSearchParams();
    if (searchParams.kategori) params.set("kategori", searchParams.kategori);
    if (searchParams.seviye) params.set("seviye", searchParams.seviye);
    params.set("sayfa", String(hedefSayfa));
    return `/admin/ayarlar/loglar?${params.toString()}`;
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Ayarlar</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-6">Sistem Logları</h1>

      <AyarlarSekmeleri />

      <div className="flex justify-end mb-6">
        <Suspense fallback={null}>
          <LoglarFiltre />
        </Suspense>
      </div>

      {loglar.length === 0 ? (
        <p className="font-body text-metin/60">Kayıt bulunamadı.</p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Seviye</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Aksiyon</th>
                <th className="px-5 py-3">Kaynak</th>
                <th className="px-5 py-3">Kullanıcı</th>
              </tr>
            </thead>
            <tbody>
              {loglar.map((l) => (
                <tr key={l.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors align-top">
                  <td className="px-5 py-3 text-metin/60 whitespace-nowrap">
                    {new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "medium" }).format(l.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        l.seviye === "ERROR" ? "bg-hata/10 text-hata" : "bg-metin/10 text-metin/60"
                      }`}
                    >
                      {l.seviye}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-metin/70">{l.kategori}</td>
                  <td className="px-5 py-3 text-metin/70">{l.aksiyon}</td>
                  <td className="px-5 py-3 text-metin/60">
                    {l.kaynakEtiketi}
                    {l.mesaj && <p className="text-xs text-metin/40 mt-0.5 max-w-xs truncate" title={l.mesaj}>{l.mesaj}</p>}
                  </td>
                  <td className="px-5 py-3 text-metin/60">{l.kullaniciEtiketi ?? "—"}</td>
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
