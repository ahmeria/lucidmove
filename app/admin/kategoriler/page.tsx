import Link from "next/link";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import KategoriSilButonu from "./KategoriSilButonu";

export const dynamic = "force-dynamic";

export default async function AdminKategoriler() {
  const kategoriler = await db.category.findMany({
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { courses: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Yönetim</p>
          <h1 className="font-display text-3xl font-bold text-metin">Kategoriler</h1>
        </div>
        <Link
          href="/admin/kategoriler/yeni"
          className="bg-metin text-zemin px-5 py-2.5 rounded-lg font-body text-sm hover:bg-koyu transition-colors"
        >
          Yeni kategori
        </Link>
      </div>

      {kategoriler.length === 0 ? (
        <p className="font-body text-metin/60">Henüz kategori yok.</p>
      ) : (
        <Kart dolgu={false} className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Sıra</th>
                <th className="px-5 py-3">Ad</th>
                <th className="px-5 py-3">Kurs</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {kategoriler.map((k) => (
                <tr key={k.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                  <td className="px-5 py-3 text-metin/60">{k.sira}</td>
                  <td className="px-5 py-3 text-metin font-medium">{k.ad}</td>
                  <td className="px-5 py-3 text-metin/60">{k._count.courses}</td>
                  <td className="px-5 py-3 text-right space-x-4">
                    <Link href={`/admin/kategoriler/${k.id}/duzenle`} className="text-vurgu hover:text-vurgu-dark">
                      Düzenle
                    </Link>
                    <KategoriSilButonu kategoriId={k.id} kategoriAd={k.ad} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Kart>
      )}
    </div>
  );
}
