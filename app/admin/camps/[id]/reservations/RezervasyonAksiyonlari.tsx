"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function RezervasyonAksiyonlari({
  campId,
  reservationId,
  kullaniciAdi,
}: {
  campId: string;
  reservationId: string;
  kullaniciAdi: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [gonderiliyor, setGonderiliyor] = useState<"ode" | "iptal" | null>(null);

  async function istek(aksiyon: "manual-payment" | "cancel", gosterge: "ode" | "iptal", basariMesaji: string) {
    setGonderiliyor(gosterge);
    try {
      const res = await fetch(`/api/admin/camps/${campId}/reservations/${reservationId}/${aksiyon}`, {
        method: "POST",
      });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "İşlem gerçekleştirilemedi");
        return;
      }
      toast.success(basariMesaji);
      router.refresh();
    } finally {
      setGonderiliyor(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <button
        onClick={() => istek("manual-payment", "ode", "Rezervasyon ödendi olarak işaretlendi.")}
        disabled={gonderiliyor !== null}
        className="font-body text-xs text-vurgu hover:text-vurgu-dark disabled:opacity-50 cursor-pointer whitespace-nowrap"
      >
        {gonderiliyor === "ode" ? "…" : "Ödendi işaretle"}
      </button>
      <button
        onClick={() => {
          if (!confirm(`${kullaniciAdi} adlı kullanıcının rezervasyonunu iptal etmek istediğinize emin misiniz?`)) return;
          istek("cancel", "iptal", "Rezervasyon iptal edildi.");
        }}
        disabled={gonderiliyor !== null}
        className="font-body text-xs text-red-700 hover:text-red-900 disabled:opacity-50 cursor-pointer"
      >
        {gonderiliyor === "iptal" ? "…" : "İptal et"}
      </button>
    </div>
  );
}
