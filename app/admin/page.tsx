import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { StatKart } from "@/components/admin/Kart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const ayBasi = new Date();
  ayBasi.setDate(1);
  ayBasi.setHours(0, 0, 0, 0);

  const [uyeSayisi, aktifAbonelikSayisi, buAyGelir, okunmamisMesajSayisi, kursSayisi, dersSayisi, ayarlar] =
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
      getSiteSettings(),
    ]);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Yönetim</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-8">Panel</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatKart etiket="Toplam üye" deger={uyeSayisi} href="/admin/uyelikler" renk="vurgu" />
        <StatKart etiket="Aktif abonelik" deger={aktifAbonelikSayisi} href="/admin/uyelikler" renk="ikincil" />
        <StatKart
          etiket="Bu ay gelir"
          deger={`₺${(buAyGelir._sum.tutar ?? 0).toString()}`}
          href="/admin/uyelikler"
          renk="ikincil"
        />
        <StatKart
          etiket="Okunmamış mesaj"
          deger={okunmamisMesajSayisi}
          href="/admin/mesajlar"
          renk={okunmamisMesajSayisi > 0 ? "amber" : "vurgu"}
        />
        <StatKart etiket="Kurs / ders" deger={`${kursSayisi} / ${dersSayisi}`} href="/admin/kurslar" renk="vurgu" />
        <StatKart
          etiket="Google Analytics"
          deger={ayarlar.gaMeasurementId ? ayarlar.gaMeasurementId : "Bağlı değil"}
          href="/admin/ayarlar"
          renk={ayarlar.gaMeasurementId ? "ikincil" : "amber"}
          altYazi={ayarlar.gaMeasurementId ? "Raporları Google Analytics'te görüntüleyin" : "Ayarlar'dan bağlayın"}
        />
      </div>
    </div>
  );
}
