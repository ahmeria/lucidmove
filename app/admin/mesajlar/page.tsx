import { db } from "@/lib/db";
import MesajSatiri from "./MesajSatiri";

export const dynamic = "force-dynamic";

export default async function AdminMesajlar() {
  const mesajlar = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      {mesajlar.length === 0 ? (
        <p className="font-body text-metin/60">Henüz mesaj yok.</p>
      ) : (
        <div className="space-y-4">
          {mesajlar.map((m) => (
            <MesajSatiri key={m.id} mesaj={{ ...m, createdAt: m.createdAt.toISOString() }} />
          ))}
        </div>
      )}
    </div>
  );
}
