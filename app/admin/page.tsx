import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { analitikOzetiniGetir } from "@/lib/analitikVerisi";
import { toplamIzlenmeSayisiniAl } from "@/lib/raporlar";
import { StatKart } from "@/components/admin/Kart";
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

export default async function AdminDashboard({ searchParams }: { searchParams: { gun?: string } }) {
  const gun = GUN_SECENEKLERI.includes(Number(searchParams.gun)) ? Number(searchParams.gun) : 28;

  const ayBasi = new Date();
  ayBasi.setDate(1);
  ayBasi.setHours(0, 0, 0, 0);

  const [uyeSayisi, aktifAbonelikSayisi, buAyGelir, okunmamisMesajSayisi, kursSayisi, dersSayisi, izlenmeSayisi] =
    await Promise.all([
      db.user.count(),
      db.subscription.count({ where: { status: "AKTIF" } }),
      db.payment.aggregate({
        _sum: { tutar: true },
        where: { durum: "BASARILI", createdAt: { gte: ayBasi } },
      }),
      db.contactMessage.count({ where: { okunduMu: false } }),
      db.course.count(),
      db.lesson.count(),
      toplamIzlenmeSayisiniAl(),
    ]);

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatKart etiket="Toplam üye" deger={uyeSayisi} href="/admin/uyelikler" renk="vurgu" ikon={UyeIkonu} />
        <StatKart
          etiket="Aktif abonelik"
          deger={aktifAbonelikSayisi}
          href="/admin/uyelikler"
          renk="ikincil"
          ikon={AbonelikIkonu}
        />
        <StatKart
          etiket="Bu ay gelir"
          deger={`₺${(buAyGelir._sum.tutar ?? 0).toString()}`}
          href="/admin/uyelikler"
          renk="ikincil"
          ikon={GelirIkonu}
        />
        <StatKart
          etiket="Okunmamış mesaj"
          deger={okunmamisMesajSayisi}
          href="/admin/mesajlar"
          renk={okunmamisMesajSayisi > 0 ? "amber" : "vurgu"}
          ikon={MesajIkonu}
        />
        <StatKart
          etiket="Kurs / ders"
          deger={`${kursSayisi} / ${dersSayisi}`}
          href="/admin/kurslar"
          renk="vurgu"
          ikon={KursIkonu}
        />
        <StatKart
          etiket="Toplam izlenme"
          deger={izlenmeSayisi}
          href="/admin/raporlar/izlenmeler"
          renk="ikincil"
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
