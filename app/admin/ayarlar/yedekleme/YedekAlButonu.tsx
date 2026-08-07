"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function YedekAlButonu() {
  const router = useRouter();
  const toast = useToast();
  const [aliniyor, setAliniyor] = useState(false);

  async function handleYedekAl() {
    setAliniyor(true);
    try {
      const res = await fetch("/api/admin/yedekleme", { method: "POST" });
      const veri = await res.json();
      if (!res.ok) {
        toast.error(veri.hata || "Yedekleme başarısız");
        return;
      }
      toast.success("Yedek alındı.");
      router.refresh();
    } catch {
      toast.error("Bir bağlantı hatası oluştu");
    } finally {
      setAliniyor(false);
    }
  }

  return (
    <button
      onClick={handleYedekAl}
      disabled={aliniyor}
      className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
    >
      {aliniyor ? "Yedek alınıyor… (biraz sürebilir)" : "Şimdi yedek al"}
    </button>
  );
}
