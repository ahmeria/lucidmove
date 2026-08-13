"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function CacheTemizleButonu() {
  const router = useRouter();
  const toast = useToast();
  const [temizleniyor, setTemizleniyor] = useState(false);

  async function handleTemizle() {
    setTemizleniyor(true);
    try {
      const res = await fetch("/api/admin/cache", { method: "POST" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Önbellek temizlenemedi");
        return;
      }
      toast.success("Önbellek temizlendi.");
      router.refresh();
    } catch {
      toast.error("Bir bağlantı hatası oluştu");
    } finally {
      setTemizleniyor(false);
    }
  }

  return (
    <button
      onClick={handleTemizle}
      disabled={temizleniyor}
      className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
    >
      {temizleniyor ? "Temizleniyor…" : "Önbelleği temizle"}
    </button>
  );
}
