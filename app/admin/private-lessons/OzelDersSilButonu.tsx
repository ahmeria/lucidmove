"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function OzelDersSilButonu({ dersId, dersBaslik }: { dersId: string; dersBaslik: string }) {
  const router = useRouter();
  const toast = useToast();
  const [siliniyor, setSiliniyor] = useState(false);

  async function handleSil() {
    setSiliniyor(true);
    try {
      const sayimRes = await fetch(`/api/admin/private-lessons/${dersId}`);
      const { satinAlmaSayisi } = await sayimRes.json();

      const uyari =
        satinAlmaSayisi > 0
          ? `"${dersBaslik}" özel dersini silmek, ${satinAlmaSayisi} satın alma kaydını da silecek (ödeme kayıtları korunur). Emin misiniz?`
          : `"${dersBaslik}" özel dersini silmek istediğinize emin misiniz?`;

      if (!confirm(uyari)) {
        setSiliniyor(false);
        return;
      }

      const res = await fetch(`/api/admin/private-lessons/${dersId}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Özel ders silinemedi");
        return;
      }
      toast.success("Özel ders silindi.");
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
