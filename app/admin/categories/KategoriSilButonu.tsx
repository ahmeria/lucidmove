"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function KategoriSilButonu({ kategoriId, kategoriAd }: { kategoriId: string; kategoriAd: string }) {
  const router = useRouter();
  const toast = useToast();
  const [siliniyor, setSiliniyor] = useState(false);

  async function handleSil() {
    setSiliniyor(true);
    try {
      const sayimRes = await fetch(`/api/admin/categories/${kategoriId}`);
      const { bagliKursSayisi } = await sayimRes.json();

      const uyari =
        bagliKursSayisi > 0
          ? `"${kategoriAd}" kategorisini silmek, bu kategoriye bağlı ${bagliKursSayisi} kursu kategorisiz bırakacak. Emin misiniz?`
          : `"${kategoriAd}" kategorisini silmek istediğinize emin misiniz?`;

      if (!confirm(uyari)) {
        setSiliniyor(false);
        return;
      }

      const res = await fetch(`/api/admin/categories/${kategoriId}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Kategori silinemedi");
        return;
      }
      toast.success("Kategori silindi.");
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  return (
    <button onClick={handleSil} disabled={siliniyor} className="text-red-700 hover:text-red-900 disabled:opacity-50">
      Sil
    </button>
  );
}
