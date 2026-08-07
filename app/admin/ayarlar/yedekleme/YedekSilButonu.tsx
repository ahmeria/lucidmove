"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function YedekSilButonu({ yedekId, dosyaAdi }: { yedekId: string; dosyaAdi: string }) {
  const router = useRouter();
  const toast = useToast();
  const [siliniyor, setSiliniyor] = useState(false);

  async function handleSil() {
    if (!confirm(`"${dosyaAdi}" yedeğini silmek istediğinize emin misiniz?`)) return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/yedekleme/${yedekId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Yedek silinemedi");
        return;
      }
      toast.success("Yedek silindi.");
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  return (
    <button onClick={handleSil} disabled={siliniyor} className="text-red-700 hover:text-red-900 disabled:opacity-50 cursor-pointer">
      Sil
    </button>
  );
}
