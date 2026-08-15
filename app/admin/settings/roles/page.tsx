import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import { adminNavGruplariniAl, AYARLAR_OGELERI } from "../../admin-nav-data";
import RolYonetimi from "./RolYonetimi";

export const dynamic = "force-dynamic";

export default async function AdminRoller() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/roles")) notFound();

  const [uyeSayisi, adminler, ozelRoller] = await Promise.all([
    db.user.count({ where: { role: "UYE" } }),
    db.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true, ad: true, email: true, sistemYoneticisiMi: true, adminRole: { select: { ad: true } } },
    }),
    db.adminRole.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { kullanicilar: true } } },
    }),
  ]);

  const kullanicilarSayfasinaErisimiVar = sayfaErisimiVarMi(session, "/admin/settings/users");

  // İkon bileşenleri sunucu->istemci sınıra taşınamaz (fonksiyon, serileştirilemez)
  // — sayfa grubu/etiket verisini sade bir yapıya indirgeyip öyle geçiyoruz.
  // Ayarlar grubu da artık seçilebilir (bkz. lib/adminYetki.ts).
  let sayfaGruplari = [
    ...adminNavGruplariniAl().map((g) => ({
      baslik: g.baslik ?? "Diğer",
      sayfalar: g.ogeler.map((o) => ({ href: o.href, label: o.label })),
    })),
    { baslik: "Ayarlar", sayfalar: AYARLAR_OGELERI.map((o) => ({ href: o.href, label: o.label })) },
  ];

  // Sistem yöneticisi olmayan (yalnızca "Roller" sayfası kendisine devredilmiş)
  // bir kullanıcı, kendi erişemediği bir sayfayı içeren rol OLUŞTURAMAZ (bkz.
  // app/api/admin/roles > yetki yükseltmesini önleyen kontrol) — arayüz de bunu
  // yansıtmalı, aksi halde işaretlediği kutular sessizce kaydedilmeden düşer.
  if (!session.sistemYoneticisiMi) {
    const kendiSayfalari = new Set(session.izinliSayfalar ?? []);
    sayfaGruplari = sayfaGruplari
      .map((g) => ({ ...g, sayfalar: g.sayfalar.filter((s) => kendiSayfalari.has(s.href)) }))
      .filter((g) => g.sayfalar.length > 0);
  }

  return (
    <div>
      <SayfaBasligi sag={<AyarlarSekmeleri />} />

      <p className="font-body text-sm text-metin/60 mb-6 max-w-2xl">
        Üye ve admin ayrımı sabittir. <strong className="text-metin">Sistem yöneticisi</strong> işareti, Ayarlar
        dahil panelin tamamına erişen tek bir üst yetki düzeyidir ve özel bir rolle devredilemez. Ayarlar
        sayfaları da dahil olmak üzere diğer tüm panel sayfalarını aşağıda oluşturacağınız özel rollerle
        istediğiniz kombinasyonda dağıtabilirsiniz.
      </p>

      <p className="font-body text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 max-w-2xl">
        <strong>Dikkat:</strong> &quot;Kullanıcılar&quot; ve &quot;Roller&quot; sayfalarına erişim, o kişinin başka
        admin hesapları ve rolleri üzerinde etki alanı kazanması demektir (kendi erişebildiği sayfalardan fazlasını
        veremese de, hesap oluşturma/silme yapabilir). &quot;Güncelleme&quot; sayfası ise sunucuyu yeniden
        derleyip yeniden başlatabilir. Bu üçünü yalnızca gerçekten güvendiğiniz kişilere verin.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <Kart>
          <p className="font-mono text-xs uppercase tracking-wide text-vurgu-dark">Üye</p>
          <p className="font-display text-2xl font-bold text-metin mt-1">{uyeSayisi}</p>
          <p className="font-body text-sm text-metin/60 mt-3">
            Aktif üyelikle kurs/ders içeriğini izleyebilir, hesabım sayfasından profilini ve üyeliğini yönetebilir.
            Yönetim paneline erişimi yoktur.
          </p>
        </Kart>

        <Kart>
          <p className="font-mono text-xs uppercase tracking-wide text-vurgu-dark">Admin</p>
          <p className="font-display text-2xl font-bold text-metin mt-1">{adminler.length}</p>
          <p className="font-body text-sm text-metin/60 mt-3">
            Sistem yöneticisi olmayan adminlerin panel erişimi, kendilerine atanmış özel role (varsa) ya da
            varsayılan içerik-yönetimi erişimine göre belirlenir.
          </p>

          <div className="mt-5 pt-5 border-t border-cizgi space-y-2">
            {adminler.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="text-metin">{a.ad}</p>
                  <p className="text-xs text-metin/45">{a.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {a.sistemYoneticisiMi ? (
                    <span className="font-mono text-[10px] uppercase tracking-wide bg-vurgu/15 text-vurgu-dark px-2 py-1 rounded-full">
                      Sistem yöneticisi
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-wide text-metin/35">
                      {a.adminRole?.ad ?? "Varsayılan admin"}
                    </span>
                  )}
                  {kullanicilarSayfasinaErisimiVar && (!a.sistemYoneticisiMi || session.sistemYoneticisiMi) && (
                    <Link href={`/admin/settings/users/${a.id}/edit`} className="text-vurgu hover:text-vurgu-dark">
                      Düzenle
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Kart>
      </div>

      <Kart baslik="Özel roller">
        <RolYonetimi roller={ozelRoller.map((r) => ({ ...r, sayfalar: r.sayfalar as string[] }))} sayfaGruplari={sayfaGruplari} />
      </Kart>
    </div>
  );
}
