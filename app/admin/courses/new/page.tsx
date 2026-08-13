import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import KursForm from "../KursForm";

export const dynamic = "force-dynamic";

export default async function YeniKurs() {
  const kategoriler = await db.category.findMany({ orderBy: { sira: "asc" }, select: { id: true, ad: true } });

  return (
    <div>
      <Kart>
        <KursForm kategoriler={kategoriler} />
      </Kart>
    </div>
  );
}
