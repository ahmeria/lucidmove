"use client";

import Link from "next/link";
import { Chart } from "./Chart";
import { ChartCard, ChartBos } from "./ChartCard";
import type { AnalitikOzeti, AnalitikToplamlari } from "@/lib/analitikVerisi";

/**
 * Google Analytics özeti — dishekimihaber projesindeki AnalyticsPanel'in
 * aynısı, LucidMove'un renk/font tokenlarına uyarlanmış hâli.
 *
 * Üç ayrı durum var ve üçü de kullanıcıya AÇIKÇA anlatılıyor:
 *   yapılandırılmamış → ayarlara yönlendiren bilgi kartı,
 *   yapılandırılmış ama hata → hata metni (yetki eksikliği en sık sebep),
 *   çalışıyor → kartlar ve grafikler.
 * Sessizce boş kart göstermek en kötüsü: kullanıcı trafiğin sıfır olduğunu sanır.
 */

const CIHAZ_ETIKETLERI: Record<string, string> = {
  desktop: "Masaüstü",
  mobile: "Mobil",
  tablet: "Tablet",
  smarttv: "Smart TV",
};

const KANAL_ETIKETLERI: Record<string, string> = {
  "Organic Search": "Arama (organik)",
  Direct: "Doğrudan",
  "Organic Social": "Sosyal (organik)",
  "Paid Search": "Arama (ücretli)",
  Referral: "Yönlendirme",
  Email: "E-posta",
  "Paid Social": "Sosyal (ücretli)",
  Display: "Görüntülü reklam",
  Unassigned: "Atanmamış",
  "Organic Video": "Video (organik)",
};

const AY_ADLARI = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function kisaTarih(iso: string): string {
  const [, ay, gun] = iso.split("-");
  return `${Number(gun)} ${AY_ADLARI[Number(ay) - 1]}`;
}

function sureFormatla(saniye: number): string {
  const toplam = Math.round(saniye);
  const dk = Math.floor(toplam / 60);
  const sn = toplam % 60;
  return dk > 0 ? `${dk}dk ${sn}sn` : `${sn}sn`;
}

/** Önceki döneme göre yüzde değişim. Önceki dönem sıfırsa oran hesaplanamaz. */
function degisim(guncel: number, onceki: number): number | null {
  if (onceki === 0) return null;
  return ((guncel - onceki) / onceki) * 100;
}

function TrendRozeti({ guncel, onceki }: { guncel: number; onceki: number }) {
  const fark = degisim(guncel, onceki);
  if (fark === null) return null;

  const yuvarlanmis = Math.round(fark * 10) / 10;
  if (yuvarlanmis === 0) {
    return <span className="font-body text-xs font-medium text-metin/40">değişim yok</span>;
  }

  const arti = yuvarlanmis > 0;
  return (
    <span className={`font-body inline-flex items-center gap-0.5 text-xs font-medium ${arti ? "text-ikincil-dark" : "text-hata"}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="size-2.5">
        {arti ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M19 12l-7 7-7-7" />}
      </svg>
      %{Math.abs(yuvarlanmis).toLocaleString("tr-TR")}
    </span>
  );
}

function AnalitikMetrik({
  etiket,
  deger,
  guncel,
  onceki,
  ipucu,
}: {
  etiket: string;
  deger: string;
  guncel: number;
  onceki: number;
  ipucu: string;
}) {
  return (
    <div className="rounded-xl border border-cizgi bg-kart p-4 shadow-organik">
      <p className="font-mono truncate text-[11px] uppercase tracking-wide text-metin/45">{etiket}</p>
      <p className="font-display mt-0.5 truncate text-2xl font-bold text-metin">{deger}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <TrendRozeti guncel={guncel} onceki={onceki} />
        <span className="font-body truncate text-xs text-metin/40">{ipucu}</span>
      </div>
    </div>
  );
}

function SiraliListe({
  satirlar,
  bosMesaj,
  height = 260,
}: {
  satirlar: { etiket: string; alt?: string; deger: number; href?: string }[];
  bosMesaj: string;
  height?: number;
}) {
  if (satirlar.length === 0) return <ChartBos mesaj={bosMesaj} height={height} />;

  const maks = Math.max(...satirlar.map((s) => s.deger), 1);

  return (
    <ol className="space-y-2">
      {satirlar.map((s, i) => (
        <li key={`${s.etiket}-${i}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-body min-w-0 flex-1 truncate text-sm text-metin/75" title={s.alt || s.etiket}>
              {s.href ? (
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-vurgu-dark">
                  {s.etiket}
                </a>
              ) : (
                s.etiket
              )}
            </span>
            <span className="font-body shrink-0 tabular-nums text-sm font-medium text-metin/60">
              {s.deger.toLocaleString("tr-TR")}
            </span>
          </div>
          {/* Çubuk, sayıları okumadan büyüklük sırasını görmeyi sağlıyor. */}
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zemin">
            <div className="h-full rounded-full bg-vurgu/70" style={{ width: `${(s.deger / maks) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function YapilandirilmamisPanel() {
  return (
    <ChartCard title="Google Analytics" description="Ziyaretçi istatistikleri için bağlantı kurulmamış.">
      <div className="flex flex-col items-start gap-3 rounded-xl bg-zemin p-5">
        <p className="font-body text-sm leading-relaxed text-metin/70">
          Measurement ID&apos;yi ve Data API servis hesabını tanımladığınızda ziyaretçi sayısı, oturumlar, trafik
          kanalları ve en çok okunan sayfalar bu ekranda görünür.
        </p>
        <Link
          href="/admin/settings"
          className="font-body inline-flex items-center rounded-lg bg-metin px-3 py-1.5 text-sm font-medium text-zemin transition-colors hover:bg-koyu"
        >
          Analytics ayarlarına git
        </Link>
      </div>
    </ChartCard>
  );
}

export function AnalyticsPanel({ veri }: { veri: AnalitikOzeti }) {
  if (!veri.yapilandirildiMi) return <YapilandirilmamisPanel />;

  if (veri.hata) {
    return (
      <ChartCard title="Google Analytics" description={`Son ${veri.gun} gün`}>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-body text-sm font-medium text-amber-800">Veri alınamadı</p>
          <p className="font-body mt-1 break-words text-xs leading-relaxed text-amber-700">{veri.hata}</p>
          <p className="font-body mt-2 text-xs text-amber-700">
            En sık sebep, servis hesabına GA4 mülkünde <span className="font-medium">Görüntüleyici</span> yetkisi
            verilmemiş olmasıdır.{" "}
            <Link href="/admin/settings" className="font-medium underline">
              Ayarlardan
            </Link>{" "}
            bağlantıyı test edebilirsiniz.
          </p>
        </div>
      </ChartCard>
    );
  }

  const t: AnalitikToplamlari = veri.toplamlar;
  const p: AnalitikToplamlari = veri.oncekiDonem;
  const gunlukVarMi = veri.gunlukSeri.some((g) => g.kullanici > 0 || g.goruntulenme > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-metin">Google Analytics</h2>
        <span className="font-body inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Şu an sitede {veri.anlikKullanici.toLocaleString("tr-TR")} kişi
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalitikMetrik
          etiket="Kullanıcı"
          deger={t.activeUsers.toLocaleString("tr-TR")}
          guncel={t.activeUsers}
          onceki={p.activeUsers}
          ipucu={`${t.newUsers.toLocaleString("tr-TR")} yeni`}
        />
        <AnalitikMetrik
          etiket="Oturum"
          deger={t.sessions.toLocaleString("tr-TR")}
          guncel={t.sessions}
          onceki={p.sessions}
          ipucu={`önceki dönem ${p.sessions.toLocaleString("tr-TR")}`}
        />
        <AnalitikMetrik
          etiket="Sayfa Görüntüleme"
          deger={t.screenPageViews.toLocaleString("tr-TR")}
          guncel={t.screenPageViews}
          onceki={p.screenPageViews}
          ipucu={`önceki dönem ${p.screenPageViews.toLocaleString("tr-TR")}`}
        />
        <AnalitikMetrik
          etiket="Ort. Oturum Süresi"
          deger={sureFormatla(t.averageSessionDuration)}
          guncel={t.averageSessionDuration}
          onceki={p.averageSessionDuration}
          ipucu={`hemen çıkma %${Math.round(t.bounceRate * 100)}`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Ziyaretçi Trendi" description={`Son ${veri.gun} gün`} className="xl:col-span-2">
          {gunlukVarMi ? (
            <Chart
              type="area"
              height={300}
              series={[
                { name: "Kullanıcı", data: veri.gunlukSeri.map((g) => g.kullanici) },
                { name: "Sayfa görüntüleme", data: veri.gunlukSeri.map((g) => g.goruntulenme) },
              ]}
              options={{
                stroke: { curve: "smooth", width: 2 },
                fill: {
                  type: "gradient",
                  gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 90, 100] },
                },
                markers: { size: 0, hover: { size: 4 } },
                xaxis: { categories: veri.gunlukSeri.map((g) => kisaTarih(g.tarih)), tickAmount: 8 },
                legend: { position: "top", horizontalAlign: "right" },
              }}
            />
          ) : (
            <ChartBos mesaj="Seçilen dönemde veri yok." height={300} />
          )}
        </ChartCard>

        <ChartCard title="Cihazlar" description="Oturumların cihaz dağılımı">
          {veri.cihazlar.length > 0 ? (
            <Chart
              type="donut"
              height={300}
              series={veri.cihazlar.map((c) => c.oturum)}
              options={{
                labels: veri.cihazlar.map((c) => CIHAZ_ETIKETLERI[c.ad] ?? c.ad),
                legend: { position: "bottom", fontSize: "11px" },
                plotOptions: {
                  pie: {
                    donut: {
                      size: "62%",
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: "Oturum",
                          fontSize: "12px",
                          formatter: () => veri.cihazlar.reduce((sum, c) => sum + c.oturum, 0).toLocaleString("tr-TR"),
                        },
                      },
                    },
                  },
                },
              }}
            />
          ) : (
            <ChartBos mesaj="Cihaz verisi yok." height={300} />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="En Çok Görüntülenen Sayfalar" description={`Son ${veri.gun} gün`} className="xl:col-span-2">
          <SiraliListe
            satirlar={veri.enCokGorulenSayfalar.map((s) => ({
              etiket: s.baslik || s.yol,
              alt: s.yol,
              deger: s.goruntulenme,
              href: s.yol.startsWith("/") ? s.yol : undefined,
            }))}
            bosMesaj="Sayfa verisi yok."
          />
        </ChartCard>

        <div className="grid gap-4">
          <ChartCard title="Trafik Kaynakları" description="Oturumların geldiği kanallar">
            <SiraliListe
              satirlar={veri.kanallar.map((k) => ({ etiket: KANAL_ETIKETLERI[k.ad] ?? k.ad, deger: k.oturum }))}
              bosMesaj="Kanal verisi yok."
              height={180}
            />
          </ChartCard>

          <ChartCard title="Ülkeler" description="En çok oturum gelen ülkeler">
            <SiraliListe
              satirlar={veri.ulkeler.map((u) => ({ etiket: u.ad, deger: u.oturum }))}
              bosMesaj="Ülke verisi yok."
              height={180}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
