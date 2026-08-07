"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

export default function GoogleAnalyticsForm({ gaMeasurementId }: { gaMeasurementId: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [deger, setDeger] = useState(gaMeasurementId ?? "");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch("/api/admin/google-analytics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gaMeasurementId: deger }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Google Analytics ayarı kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-body max-w-xl">
      <p className="text-sm text-metin/60">
        GA4 Measurement ID&apos;nizi girin (ör. <code className="text-xs bg-cizgi/50 px-1.5 py-0.5 rounded">G-ABC1234XYZ</code>)
        — kaydedildiğinde site sayfalarına izleme kodu otomatik eklenir. Ziyaretçi/sayfa görüntülenme raporlarını{" "}
        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-vurgu hover:text-vurgu-dark underline"
        >
          analytics.google.com
        </a>{" "}
        üzerinden görüntüleyebilirsiniz.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm text-metin/70 mb-1.5">Measurement ID</label>
          <input
            value={deger}
            onChange={(e) => setDeger(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none font-mono text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
