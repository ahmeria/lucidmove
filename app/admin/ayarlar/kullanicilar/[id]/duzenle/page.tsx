import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import AyarlarSekmeleri from "../../../AyarlarSekmeleri";
import KullaniciForm from "./KullaniciForm";

export const dynamic = "force-dynamic";

export default async function KullaniciDuzenle({ params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const kullanici = await db.user.findUnique({
    where: { id: params.id },
    select: { id: true, ad: true, email: true, telefon: true, role: true, sistemYoneticisiMi: true },
  });
  if (!kullanici) notFound();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Ayarlar / Kullanıcılar</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-6">{kullanici.ad}</h1>

      <AyarlarSekmeleri />

      <Kart>
        <KullaniciForm kullanici={kullanici} kendisiMi={kullanici.id === session.user?.id} />
      </Kart>
    </div>
  );
}
