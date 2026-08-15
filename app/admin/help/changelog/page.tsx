import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { GUNCELLEME_GECMISI } from "@/lib/changelogVerisi";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import YardimSekmeleri from "../YardimSekmeleri";

export const dynamic = "force-dynamic";

// Yardım'ın diğer yarısı — bkz. app/admin/help/page.tsx. İzin kontrolüne
// bağlı değil, oturumu olan her admin görebilir (bkz. YARDIM_OGELERI notu).
export default async function AdminGuncellemeGecmisi() {
  const session = await getAdminSession();
  if (!session) notFound();

  return (
    <div>
      <SayfaBasligi sag={<YardimSekmeleri />} />

      <Kart>
        <p className="font-body text-sm text-metin/60 mb-8 max-w-2xl">
          LucidMove&rsquo;a bugüne kadar eklenen tüm sürümler — en yenisi en üstte. Sunucudaki güncel sürüm ve
          güncelleme işlemi için bkz. Ayarlar &gt; Güncelleme.
        </p>

        <ol className="space-y-8">
          {GUNCELLEME_GECMISI.map((g, i) => (
            <li key={g.surum} className="relative pl-7">
              {i < GUNCELLEME_GECMISI.length - 1 && (
                <span className="absolute left-[5px] top-4 bottom-[-2rem] w-px bg-cizgi" aria-hidden />
              )}
              <span className="absolute left-0 top-1.5 size-[11px] rounded-full bg-vurgu ring-4 ring-vurgu/15" aria-hidden />

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs font-bold text-vurgu-dark bg-vurgu/10 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                  v{g.surum}
                </span>
                <span className="text-xs text-metin/40">
                  {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(`${g.tarih}T00:00:00`))}
                </span>
              </div>

              <h3 className="font-display font-bold text-metin mt-2">{g.baslik}</h3>

              <ul className="mt-2.5 space-y-1.5">
                {g.degisiklikler.map((d, j) => (
                  <li key={j} className="flex gap-2.5 text-sm text-metin/70 font-body">
                    <span className="text-metin/30 mt-[3px]">–</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Kart>
    </div>
  );
}
