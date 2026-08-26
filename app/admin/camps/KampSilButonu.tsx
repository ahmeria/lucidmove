"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function KampSilButonu({ kampId, kampAdi }: { kampId: string; kampAdi: string }) {
  const router = useRouter();
  const toast = useToast();
  const [siliniyor, setSiliniyor] = useState(false);

  async function handleSil() {
    setSiliniyor(true);
    try {
      const sayimRes = await fetch(`/api/admin/camps/${kampId}`);
      const { rezervasyonSayisi } = await sayimRes.json();

      const uyari =
        rezervasyonSayisi > 0
          ? `"${kampAdi}" kampını silmek, ${rezervasyonSayisi} rezervasyon/satın alma kaydını da silecek (ödeme kayıtları korunur). Emin misiniz?`
          : `"${kampAdi}" kampını silmek istediğinize emin misiniz?`;

      if (!confirm(uyari)) {
        setSiliniyor(false);
        return;
      }

      const res = await fetch(`/api/admin/camps/${kampId}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Kamp silinemedi");
        return;
      }
      toast.success("Kamp silindi.");
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
