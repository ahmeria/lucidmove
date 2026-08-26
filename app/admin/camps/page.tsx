import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { suresiGecenRezervasyonlariGuncelle } from "@/lib/kamplar";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import KampSilButonu from "./KampSilButonu";

export const dynamic = "force-dynamic";

function BosResimIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path
        d="m4.5 16 4.5-4.5a1.5 1.5 0 0 1 2.1 0l2.4 2.4M13.5 13.2 15 11.7a1.5 1.5 0 0 1 2.1 0l1.9 1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const tarihFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminKamplar() {
  // Cron yok — listeleme öncesi süresi geçmiş rezervasyonlar güncellenir
  // (bkz. lib/kamplar.ts), doluluk sayıları bundan SONRA hesaplanır.
  await suresiGecenRezervasyonlariGuncelle();

  const kamplar = await db.camp.findMany({ orderBy: { baslangicTarihi: "asc" } });
  const gruplar =
    kamplar.length > 0
      ? await db.campReservation.groupBy({
          by: ["campId"],
          where: { campId: { in: kamplar.map((k) => k.id) }, status: { in: ["REZERVE_EDILDI", "ODENDI"] } },
          _count: { _all: true },
        })
      : [];
  const doluluk = new Map(gruplar.map((g) => [g.campId, g._count._all]));

  return (
    <div>
      <SayfaBasligi
        sag={
          <Link
            href="/admin/camps/new"
            className="bg-metin text-zemin px-5 py-2.5 rounded-lg font-body text-sm hover:bg-koyu transition-colors cursor-pointer"
          >
            Yeni kamp
          </Link>
        }
      />

      {kamplar.length === 0 ? (
        <p className="font-body text-metin/60">Henüz kamp yok.</p>
      ) : (
        <div className="space-y-3">
          {kamplar.map((k) => {
            const dolu = doluluk.get(k.id) ?? 0;
            const gectiMi = k.bitisTarihi < new Date();
            return (
              <div
                key={k.id}
                className="flex flex-wrap items-center gap-4 border border-cizgi rounded-lg p-4 bg-kart"
              >
                <Link
                  href={`/admin/camps/${k.id}/edit`}
                  className="relative shrink-0 size-20 rounded-xl overflow-hidden border border-cizgi bg-zemin"
                >
                  {k.kapakUrl ? (
                    <Image src={k.kapakUrl} alt="" fill sizes="80px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-metin/20">
                      <BosResimIkonu className="size-6" />
                    </span>
                  )}
                </Link>

                <Link href={`/admin/camps/${k.id}/edit`} className="flex-1 min-w-[10rem]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-ikincil-dark uppercase tracking-wide">{k.yer}</span>
                    {!k.yayindaMi && (
                      <span className="font-mono text-[10px] uppercase tracking-wide bg-metin/10 text-metin/60 px-2 py-0.5 rounded-full">
                        Taslak
                      </span>
                    )}
                    {gectiMi && (
                      <span className="font-mono text-[10px] uppercase tracking-wide bg-metin/10 text-metin/60 px-2 py-0.5 rounded-full">
                        Geçmiş
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-base font-bold text-metin mt-0.5 line-clamp-1">{k.ad}</h3>
                  <p className="font-mono text-xs text-metin/45 mt-1">
                    {tarihFormat.format(k.baslangicTarihi)} – {tarihFormat.format(k.bitisTarihi)} · {dolu}/
                    {k.kapasite} dolu
                  </p>
                </Link>

                <div className="flex items-center gap-4 shrink-0">
                  <Link
                    href={`/admin/camps/${k.id}/reservations`}
                    className="font-body text-sm text-vurgu hover:text-vurgu-dark"
                  >
                    Rezervasyonlar {dolu > 0 && `(${dolu})`}
                  </Link>
                  <Link href={`/admin/camps/${k.id}/edit`} className="font-body text-sm text-vurgu hover:text-vurgu-dark">
                    Düzenle
                  </Link>
                  <KampSilButonu kampId={k.id} kampAdi={k.ad} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
