"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";

type Metinler = {
  heroEyebrow: string;
  heroBaslik: string;
  heroAltBaslik: string;
  heroGorselUrl: string;
  heroCtaBirincil: string;
  heroCtaIkincil: string;
  uyelikEyebrow: string;
  uyelikBaslik: string;
  uyelikAltBaslik: string;
};

const alan = "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

export default function AnaSayfaMetinleriForm({ ayarlar }: { ayarlar: Metinler }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(ayarlar);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  function alanGuncelle<K extends keyof Metinler>(anahtar: K, deger: string) {
    setForm((f) => ({ ...f, [anahtar]: deger }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch("/api/admin/ayarlar", {
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
    toast.success("Ana sayfa metinleri kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-body">
      <div>
        <h3 className="font-body text-sm uppercase tracking-wide text-metin/50 mb-4">
          Hero — sayfa açılır açılmaz görünen üst bölüm
        </h3>
        <div className="space-y-4">
          <div>
            <label className={etiket}>Arkaplan görseli</label>
            <GorselInput value={form.heroGorselUrl} onChange={(v) => alanGuncelle("heroGorselUrl", v)} oran={16 / 9} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={etiket}>Eyebrow (küçük üst etiket)</label>
              <input value={form.heroEyebrow} onChange={(e) => alanGuncelle("heroEyebrow", e.target.value)} className={alan} />
            </div>
            <div>
              <label className={etiket}>Başlık</label>
              <textarea value={form.heroBaslik} onChange={(e) => alanGuncelle("heroBaslik", e.target.value)} rows={2} className={alan + " resize-none"} />
            </div>
          </div>
          <p className="text-xs text-metin/45 -mt-2">
            Başlıkta *yıldız içine alınan* kısım vurgulu (accent renkli) gösterilir — ör. &quot;Nefesinizin
            *hızında* bir yoga pratiği.&quot;
          </p>
          <div>
            <label className={etiket}>Alt başlık</label>
            <textarea value={form.heroAltBaslik} onChange={(e) => alanGuncelle("heroAltBaslik", e.target.value)} rows={2} className={alan + " resize-none"} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={etiket}>Birincil buton metni</label>
              <input value={form.heroCtaBirincil} onChange={(e) => alanGuncelle("heroCtaBirincil", e.target.value)} className={alan} />
            </div>
            <div>
              <label className={etiket}>İkincil buton metni</label>
              <input value={form.heroCtaIkincil} onChange={(e) => alanGuncelle("heroCtaIkincil", e.target.value)} className={alan} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-body text-sm uppercase tracking-wide text-metin/50 mb-4">Üyelik bölümü başlığı</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={etiket}>Eyebrow</label>
            <input value={form.uyelikEyebrow} onChange={(e) => alanGuncelle("uyelikEyebrow", e.target.value)} className={alan} />
          </div>
          <div>
            <label className={etiket}>Başlık</label>
            <input value={form.uyelikBaslik} onChange={(e) => alanGuncelle("uyelikBaslik", e.target.value)} className={alan} />
          </div>
          <div>
            <label className={etiket}>Alt başlık</label>
            <input value={form.uyelikAltBaslik} onChange={(e) => alanGuncelle("uyelikAltBaslik", e.target.value)} className={alan} />
          </div>
        </div>
        <p className="text-xs text-metin/45 mt-2">
          Plan kartlarının kendisi (fiyat, özellikler) burada değil, Fiyatlandırma sayfasında düzenlenir.
        </p>
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
