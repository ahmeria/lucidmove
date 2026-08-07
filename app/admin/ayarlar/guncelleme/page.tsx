import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import GuncellemeManager from "./GuncellemeManager";

export const dynamic = "force-dynamic";

export default async function AdminGuncelleme() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  return (
    <div>
      <SayfaBasligi sag={<AyarlarSekmeleri />} />

      <Kart>
        <GuncellemeManager />
      </Kart>
    </div>
  );
}
