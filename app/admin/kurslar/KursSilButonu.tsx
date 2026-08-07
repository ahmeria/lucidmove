"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function KursSilButonu({ kursId, kursBaslik }: { kursId: string; kursBaslik: string }) {
  const router = useRouter();
  const toast = useToast();
  const [siliniyor, setSiliniyor] = useState(false);

  async function handleSil() {
    setSiliniyor(true);
    try {
      const sayimRes = await fetch(`/api/admin/kurslar/${kursId}`);
      const { etkilenenKullanici } = await sayimRes.json();

      const uyari =
        etkilenenKullanici > 0
          ? `"${kursBaslik}" kursunu silmek, ${etkilenenKullanici} kullanıcının bu kurstaki izleme geçmişini de silecek. Emin misiniz?`
          : `"${kursBaslik}" kursunu silmek istediğinize emin misiniz?`;

      if (!confirm(uyari)) {
        setSiliniyor(false);
        return;
      }

      const res = await fetch(`/api/admin/kurslar/${kursId}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Kurs silinemedi");
        return;
      }
      toast.success("Kurs silindi.");
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
