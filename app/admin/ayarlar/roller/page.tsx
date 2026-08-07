import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import AyarlarSekmeleri from "../AyarlarSekmeleri";

export const dynamic = "force-dynamic";

export default async function AdminRoller() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const [uyeSayisi, adminler] = await Promise.all([
    db.user.count({ where: { role: "UYE" } }),
    db.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true, ad: true, email: true, sistemYoneticisiMi: true },
    }),
  ]);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Ayarlar</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-6">Roller</h1>

      <AyarlarSekmeleri />

      <p className="font-body text-sm text-metin/60 mb-6 max-w-2xl">
        LucidMove sabit iki rol kullanır — dinamik rol/izin tanımlama yok. Admin hesapları içinde yalnızca{" "}
        <strong className="text-metin">sistem yöneticisi</strong> işaretli olanlar bu Ayarlar bölümüne erişebilir;
        işareti Kullanıcılar sayfasından değiştirebilirsiniz.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
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
            Kategori/kurs/ders içeriğini, fiyatlandırmayı, üyelikleri ve mesajları yönetir. Sistem yöneticisi
            işareti olmadan Ayarlar bölümünü göremez.
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
                    <span className="font-mono text-[10px] uppercase tracking-wide text-metin/35">İçerik admini</span>
                  )}
                  <Link href={`/admin/ayarlar/kullanicilar/${a.id}/duzenle`} className="text-vurgu hover:text-vurgu-dark">
                    Düzenle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Kart>
      </div>
    </div>
  );
}
