import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../../../AyarlarSekmeleri";
import KullaniciForm from "./KullaniciForm";

export const dynamic = "force-dynamic";

export default async function KullaniciDuzenle({ params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/users")) notFound();

  const [kullanici, rollerHam] = await Promise.all([
    db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        ad: true,
        email: true,
        telefon: true,
        role: true,
        sistemYoneticisiMi: true,
        adminRoleId: true,
      },
    }),
    db.adminRole.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true, sayfalar: true } }),
  ]);
  if (!kullanici) notFound();
  // Sistem yöneticisi olmayan bir "Kullanıcılar" yetkilisi, sistem yöneticisi
  // işaretli bir hesaba hiç dokunamaz (bkz. app/api/admin/users) — düzenleme
  // formunu göstermek yerine burada da engelliyoruz.
  if (kullanici.sistemYoneticisiMi && !session.sistemYoneticisiMi) notFound();

  let roller = rollerHam;
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
        <KullaniciForm
          kullanici={kullanici}
          kendisiMi={kullanici.id === session.user?.id}
          roller={roller}
          sistemYoneticisiVerilebilir={session.sistemYoneticisiMi}
        />
      </Kart>
    </div>
  );
}
