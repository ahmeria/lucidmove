import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import Kart from "@/components/admin/Kart";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import GuncellemeManager from "./GuncellemeManager";

export const dynamic = "force-dynamic";

export default async function AdminGuncelleme() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Ayarlar</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-6">Güncelleme</h1>

      <AyarlarSekmeleri />

      <Kart>
        <GuncellemeManager />
      </Kart>
    </div>
  );
}
