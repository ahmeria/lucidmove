import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import YedekAlButonu from "./YedekAlButonu";
import YedekSilButonu from "./YedekSilButonu";

export const dynamic = "force-dynamic";

function boyutuBicimlendir(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${(byte / 1024).toFixed(1)} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminYedekleme() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const yedekler = await db.backup.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { ad: true } } },
    take: 50,
  });

  return (
    <div>
      <SayfaBasligi sag={<AyarlarSekmeleri />} />

      <p className="font-body text-sm text-metin/60 mb-6 max-w-2xl">
        Veritabanının tam bir kopyasını (.sql.gz) alır. Otomatik/zamanlanmış yedekleme bu sürümde yok — yalnızca
        elle tetiklenir. Yedek dosyaları sunucuda <code className="text-xs bg-cizgi/50 px-1.5 py-0.5 rounded">
          storage/backups/
        </code>{" "}
        altında tutulur.
      </p>

      <YedekAlButonu />

      {yedekler.length === 0 ? (
        <p className="font-body text-metin/60 mt-8">Henüz yedek alınmadı.</p>
      ) : (
        <Kart dolgu={false} className="mt-8 overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Dosya</th>
                <th className="px-5 py-3">Boyut</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Alan</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {yedekler.map((y) => (
                <tr key={y.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                  <td className="px-5 py-3 text-metin/60 whitespace-nowrap">
                    {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(y.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-metin/70 font-mono text-xs">{y.dosyaAdi}</td>
                  <td className="px-5 py-3 text-metin/60">{boyutuBicimlendir(y.dosyaBoyutu)}</td>
                  <td className="px-5 py-3">
                    {y.durum === "basarili" ? (
                      <span className="font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        Başarılı
                      </span>
                    ) : (
                      <span
                        title={y.hataMesaji ?? undefined}
                        className="font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-hata/10 text-hata"
                      >
                        Başarısız
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-metin/60">{y.createdBy?.ad ?? "—"}</td>
                  <td className="px-5 py-3 text-right space-x-4 whitespace-nowrap">
                    {y.durum === "basarili" && (
                      <a href={`/api/admin/yedekleme/${y.id}/indir`} className="text-vurgu hover:text-vurgu-dark">
                        İndir
                      </a>
                    )}
                    <YedekSilButonu yedekId={y.id} dosyaAdi={y.dosyaAdi} />
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
