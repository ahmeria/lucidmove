import { db } from "@/lib/db";
import MesajSatiri from "./MesajSatiri";

export const dynamic = "force-dynamic";

export default async function AdminMesajlar() {
  const mesajlar = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Yönetim</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-8">Mesajlar</h1>

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
