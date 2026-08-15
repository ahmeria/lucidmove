import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../../AyarlarSekmeleri";
import YeniKullaniciFormu from "./YeniKullaniciFormu";

export const dynamic = "force-dynamic";

export default async function YeniKullanici() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/users")) notFound();

  let roller = await db.adminRole.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true, sayfalar: true } });
  // Sistem yöneticisi olmayan bir "Kullanıcılar" yetkilisi, yalnızca kendi
  // erişebildiği sayfalardan oluşan bir rol atayabilir (bkz.
  // app/api/admin/users) — arayüz de yalnızca o rolleri listelemeli, aksi
  // halde seçilince sunucu tarafından reddedilen seçenekler görürdü.
  if (!session.sistemYoneticisiMi) {
    const kendiSayfalari = new Set(session.izinliSayfalar ?? []);
    roller = roller.filter((r) => (r.sayfalar as string[]).every((s) => kendiSayfalari.has(s)));
  }

  return (
    <div>
      <SayfaBasligi
        sag={<AyarlarSekmeleri sistemYoneticisiMi={session.sistemYoneticisiMi} izinliSayfalar={session.izinliSayfalar} />}
      />

      <Kart>
        <YeniKullaniciFormu roller={roller} sistemYoneticisiVerilebilir={session.sistemYoneticisiMi} />
      </Kart>
    </div>
  );
}
