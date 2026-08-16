import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { analitikOzetiniGetir } from "@/lib/analitikVerisi";
import { toplamIzlenmeSayisiniAl } from "@/lib/raporlar";
import { ayAraligi, ayEtiketi, gosterilecekAy, TUM_ZAMANLAR } from "@/lib/ayFiltresi";
import { StatKart } from "@/components/admin/Kart";
import AyFiltresi from "@/components/admin/AyFiltresi";
import { UyeIkonu, AbonelikIkonu, GelirIkonu, MesajIkonu, KursIkonu, IzlenmeIkonu } from "@/components/admin/StatIkonlari";
import { AnalyticsPanel } from "@/components/admin/charts/AnalyticsPanel";

export const dynamic = "force-dynamic";

const GUN_SECENEKLERI = [7, 28, 90];

function GunSecici({ gun }: { gun: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-zemin p-1">
      {GUN_SECENEKLERI.map((g) => (
        <Link
          key={g}
          href={`/admin?gun=${g}`}
          scroll={false}
          className={`rounded-full px-3 py-1.5 font-body text-sm transition-colors ${
            g === gun ? "bg-vurgu text-white shadow-organik" : "text-metin/60 hover:bg-cizgi/50"
          }`}
        >
          {g} gün
        </Link>
      ))}
    </div>
  );
}

function AnalitikIskeleti() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 animate-pulse rounded bg-zemin" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-cizgi bg-kart" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-cizgi bg-kart" />
    </div>
  );
}

// GA çağrısı saniyeler sürebiliyor; yüklenene kadar sayfanın kalanı beklemesin
// diye ayrı bir Server Component + Suspense içinde (dishekimihaber'deki aynı desen).
async function AnalitikBolumu({ gun }: { gun: number }) {
  return <AnalyticsPanel veri={await analitikOzetiniGetir(gun)} />;
}

export default async function AdminDashboard({ searchParams }: { searchParams: { gun?: string; ay?: string } }) {
  const gun = GUN_SECENEKLERI.includes(Number(searchParams.gun)) ? Number(searchParams.gun) : 28;

  // Panel varsayılan olarak BU AYIN özetini gösterir (bkz. lib/ayFiltresi.ts)
  // — "Tüm zamanlar" filtreden açıkça seçilebilir. araligi null ise (tüm
  // zamanlar) dönem-bağlı kartlar filtresiz, tüm-zamanlar toplamını gösterir.
  const araligi = ayAraligi(searchParams.ay);
  const seciliAy = gosterilecekAy(searchParams.ay);
  const donemEtiketi = ayEtiketi(seciliAy);
  const tumZamanlarMi = seciliAy === TUM_ZAMANLAR;

  const [uyeSayisi, aktifAbonelikSayisi, gelir, okunmamisMesajSayisi, kursSayisi, dersSayisi, izlenmeSayisi] =
    await Promise.all([
      // "Toplam üye" yalnızca role: UYE olanları sayar — admin hesapları
      // (bu dashboard'u görüntüleyen dahil) buraya karışmasın diye. Bir
      // dönem seçiliyken bu, o dönemde KAYIT OLAN üye sayısına daralır
      // (bkz. aşağıdaki dinamik etiket).
      db.user.count({ where: { role: "UYE", ...(araligi ? { createdAt: araligi } : {}) } }),
      db.subscription.count({ where: { status: "AKTIF" } }),
      db.payment.aggregate({
        _sum: { tutar: true },
        where: { durum: "BASARILI", ...(araligi ? { createdAt: araligi } : {}) },
      }),
      db.contactMessage.count({ where: { okunduMu: false } }),
      db.course.count(),
      db.lesson.count(),
      toplamIzlenmeSayisiniAl(araligi),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-wide text-metin/40">Özet</p>
        <AyFiltresi />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatKart
          etiket={tumZamanlarMi ? "Toplam üye" : "Yeni üye"}
          deger={uyeSayisi}
          href="/admin/subscriptions"
          renk="vurgu"
          altYazi={donemEtiketi}
          ikon={UyeIkonu}
        />
        <StatKart
          etiket="Aktif abonelik"
          deger={aktifAbonelikSayisi}
          href="/admin/subscriptions"
          renk="ikincil"
          altYazi="Güncel durum"
          ikon={AbonelikIkonu}
        />
        <StatKart
          etiket="Gelir"
          deger={`₺${(gelir._sum.tutar ?? 0).toString()}`}
          href="/admin/subscriptions"
          renk="ikincil"
          altYazi={donemEtiketi}
          ikon={GelirIkonu}
        />
        <StatKart
          etiket="Okunmamış mesaj"
          deger={okunmamisMesajSayisi}
          href="/admin/messages"
          renk={okunmamisMesajSayisi > 0 ? "amber" : "vurgu"}
          ikon={MesajIkonu}
        />
        <StatKart
          etiket="Kurs / ders"
          deger={`${kursSayisi} / ${dersSayisi}`}
          href="/admin/courses"
          renk="vurgu"
          ikon={KursIkonu}
        />
        <StatKart
          etiket="İzlenme"
          deger={izlenmeSayisi}
          href="/admin/reports/views"
          renk="ikincil"
          altYazi={donemEtiketi}
          ikon={IzlenmeIkonu}
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="font-mono text-xs uppercase tracking-wide text-metin/40">Trafik</p>
          <GunSecici gun={gun} />
        </div>
        <Suspense key={gun} fallback={<AnalitikIskeleti />}>
          <AnalitikBolumu gun={gun} />
        </Suspense>
      </div>
    </div>
  );
}
