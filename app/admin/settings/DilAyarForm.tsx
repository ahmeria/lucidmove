"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

const DIL_ETIKETI: Record<string, string> = { tr: "Türkçe", en: "İngilizce", az: "Azerbaycan dili" };

// Frontend üç dilde (bkz. /admin/settings/page-design'daki dil sekmeli
// alanlar) — burası kayıtlı "varsayılan site dili" tercihini tutuyor. URL'de
// hangi dilin öneksiz (gerçek routing varsayılanı) olacağı kod seviyesinde
// (i18n/routing.ts) sabit — bu alan bunu henüz canlı DEĞİŞTİRMİYOR, yalnızca
// tercihi kaydediyor (bkz. prisma/schema.prisma > SiteSettings.varsayilanDil
// yorumu).
export default function DilAyarForm({ varsayilanDil }: { varsayilanDil: string }) {
  const router = useRouter();
  const toast = useToast();
  const [dil, setDil] = useState(varsayilanDil);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ varsayilanDil: dil }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Dil ayarı kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <p className="text-sm text-metin/60 max-w-2xl">
        Site şu an Türkçe, İngilizce ve Azerbaycan dilinde yayında (sağ üstteki dil seçiciyle değiştirilir).
        Buradaki seçim, hangi dilin sitenin &quot;asıl&quot; dili sayıldığını kaydeder.
      </p>

      <div className="max-w-xs">
        <label className="block text-sm text-metin/70 mb-1.5">Varsayılan site dili</label>
        <select
          value={dil}
          onChange={(e) => setDil(e.target.value)}
          className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
        >
          {Object.entries(DIL_ETIKETI).map(([kod, ad]) => (
            <option key={kod} value={kod}>
              {ad}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
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
