import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import YardimSekmeleri from "./YardimSekmeleri";
import KullanimKilavuzu from "./KullanimKilavuzu";

export const dynamic = "force-dynamic";

// Yardım, Ayarlar'ın aksine bir izinli-sayfa kontrolüne bağlı değil —
// yalnızca giriş yapmış bir admin olmak yeterli (bkz. YARDIM_OGELERI notu,
// app/admin/admin-nav-data.tsx).
export default async function AdminYardim() {
  const session = await getAdminSession();
  if (!session) notFound();

  return (
    <div>
      <SayfaBasligi sag={<YardimSekmeleri />} />
      <KullanimKilavuzu />
    </div>
  );
}
