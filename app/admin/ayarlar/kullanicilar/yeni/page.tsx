import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../../AyarlarSekmeleri";
import YeniKullaniciFormu from "./YeniKullaniciFormu";

export const dynamic = "force-dynamic";

export default async function YeniKullanici() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const roller = await db.adminRole.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } });

  return (
    <div>
      <SayfaBasligi sag={<AyarlarSekmeleri />} />

      <Kart>
        <YeniKullaniciFormu roller={roller} />
      </Kart>
    </div>
  );
}
