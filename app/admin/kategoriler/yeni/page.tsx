import Kart from "@/components/admin/Kart";
import KategoriForm from "../KategoriForm";

export default function YeniKategori() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-vurgu mb-2">Yönetim</p>
      <h1 className="font-display text-3xl font-bold text-metin mb-8">Yeni kategori</h1>
      <Kart>
        <KategoriForm />
      </Kart>
    </div>
  );
}
