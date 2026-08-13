"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";

type Profil = {
  ad: string;
  bio: string;
  sertifikalar: string;
  yaklasim: string;
  portreUrl: string;
  hakkimdaTeaserOzet: string;
};

const alan = "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

export default function EgitmenForm({ profil }: { profil: Profil }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(profil);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  function alanGuncelle<K extends keyof Profil>(anahtar: K, deger: string) {
    setForm((f) => ({ ...f, [anahtar]: deger }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch("/api/admin/egitmen", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Eğitmen profili kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <div>
        <label className={etiket}>Ad</label>
        <input value={form.ad} onChange={(e) => alanGuncelle("ad", e.target.value)} className={alan + " max-w-sm"} />
      </div>
      <div>
        <label className={etiket}>Portre görseli — Hakkımda bölümünde gösterilir</label>
        <GorselInput value={form.portreUrl} onChange={(v) => alanGuncelle("portreUrl", v)} oran={4 / 5} />
      </div>
      <div>
        <label className={etiket}>Ana sayfa tanıtım cümlesi</label>
        <input
          value={form.hakkimdaTeaserOzet}
          onChange={(e) => alanGuncelle("hakkimdaTeaserOzet", e.target.value)}
          className={alan}
        />
      </div>
      <div>
        <label className={etiket}>Biyografi (paragraflar arasında boş satır bırakın)</label>
        <textarea value={form.bio} onChange={(e) => alanGuncelle("bio", e.target.value)} rows={8} className={alan + " resize-none"} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={etiket}>Sertifikalar (satır satır)</label>
          <textarea
            value={form.sertifikalar}
            onChange={(e) => alanGuncelle("sertifikalar", e.target.value)}
            rows={4}
            className={alan + " resize-none"}
          />
        </div>
        <div>
          <label className={etiket}>Yaklaşım (satır satır)</label>
          <textarea value={form.yaklasim} onChange={(e) => alanGuncelle("yaklasim", e.target.value)} rows={4} className={alan + " resize-none"} />
        </div>
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
