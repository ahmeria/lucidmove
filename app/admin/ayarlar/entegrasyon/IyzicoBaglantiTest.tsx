"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function IyzicoBaglantiTest() {
  const toast = useToast();
  const [testEdiliyor, setTestEdiliyor] = useState(false);

  async function testEt() {
    setTestEdiliyor(true);
    try {
      const res = await fetch("/api/admin/entegrasyon/iyzico-test", { method: "POST" });
      const veri = await res.json();
      if (veri.basarili) toast.success(veri.mesaj);
      else toast.error(veri.mesaj || "Bağlantı testi başarısız oldu.");
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setTestEdiliyor(false);
    }
  }

  return (
    <button
      type="button"
      onClick={testEt}
      disabled={testEdiliyor}
      className="border border-cizgi text-metin px-5 py-2.5 rounded-lg text-sm hover:border-vurgu transition-colors disabled:opacity-60 cursor-pointer"
    >
      {testEdiliyor ? "Test ediliyor…" : "Bağlantıyı test et"}
    </button>
  );
}
