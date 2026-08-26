"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

// Kamplar'daki "Ödendi işaretle" emsali — burada rezervasyon/iptal kavramı
// olmadığı için tek aksiyon bu (banka havalesi vb. Iyzico dışı ödeme
// senaryosu için).
export default function SatinAlmaAksiyonlari({
  dersId,
  purchaseId,
}: {
  dersId: string;
  purchaseId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function odendiIsaretle() {
    setGonderiliyor(true);
    try {
      const res = await fetch(`/api/admin/private-lessons/${dersId}/purchases/${purchaseId}/manual-payment`, {
        method: "POST",
      });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "İşlem gerçekleştirilemedi");
        return;
      }
      toast.success("Satın alma ödendi olarak işaretlendi.");
      router.refresh();
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <button
      onClick={odendiIsaretle}
      disabled={gonderiliyor}
      className="font-body text-xs text-vurgu hover:text-vurgu-dark disabled:opacity-50 cursor-pointer whitespace-nowrap"
    >
      {gonderiliyor ? "…" : "Ödendi işaretle"}
    </button>
  );
}
