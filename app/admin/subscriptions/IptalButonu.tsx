"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function IptalButonu({ abonelikId, kullaniciAdi }: { abonelikId: string; kullaniciAdi: string }) {
  const router = useRouter();
  const toast = useToast();
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleIptal() {
    if (!confirm(`${kullaniciAdi} adlı kullanıcının aboneliğini iptal etmek istediğinize emin misiniz?`)) return;
    setGonderiliyor(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${abonelikId}/cancel`, { method: "POST" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Üyelik iptal edilemedi");
        return;
      }
      toast.success("Üyelik iptal edildi.");
      router.refresh();
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <button onClick={handleIptal} disabled={gonderiliyor} className="text-red-700 hover:text-red-900 disabled:opacity-50 text-xs cursor-pointer">
      İptal et
    </button>
  );
}
