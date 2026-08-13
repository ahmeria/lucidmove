import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../../../AyarlarSekmeleri";
import KullaniciForm from "./KullaniciForm";

export const dynamic = "force-dynamic";

export default async function KullaniciDuzenle({ params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const [kullanici, roller] = await Promise.all([
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
    db.adminRole.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
  ]);
  if (!kullanici) notFound();

  return (
    <div>
      <SayfaBasligi sag={<AyarlarSekmeleri />} />

      <Kart>
        <KullaniciForm kullanici={kullanici} kendisiMi={kullanici.id === session.user?.id} roller={roller} />
      </Kart>
    </div>
  );
}
