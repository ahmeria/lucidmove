"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

type Ayarlar = {
  siteBasligi: string;
  siteAciklamasi: string;
  iletisimEmail: string;
  calismaSaatleri: string;
  instagramUrl: string;
  footerTagline: string;
};

const alan = "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

// Hero / Üyelik bölümü başlığı / Eğitmen profili artık burada değil — bkz.
// /admin/ayarlar/sayfa-tasarimi. Bu form yalnızca sistem geneli iletişim/SEO
// bilgilerini taşıyor.
export default function SiteAyarlariForm({ ayarlar }: { ayarlar: Ayarlar }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(ayarlar);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  function alanGuncelle<K extends keyof Ayarlar>(anahtar: K, deger: string) {
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
    toast.success("Site ayarları kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-body">
      <div>
        <h3 className="font-body text-sm uppercase tracking-wide text-metin/50 mb-4">İletişim &amp; sosyal</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={etiket}>E-posta</label>
            <input type="email" value={form.iletisimEmail} onChange={(e) => alanGuncelle("iletisimEmail", e.target.value)} className={alan} />
          </div>
          <div>
            <label className={etiket}>Çalışma saatleri</label>
            <input value={form.calismaSaatleri} onChange={(e) => alanGuncelle("calismaSaatleri", e.target.value)} className={alan} />
          </div>
          <div>
            <label className={etiket}>Instagram URL</label>
            <input value={form.instagramUrl} onChange={(e) => alanGuncelle("instagramUrl", e.target.value)} className={alan} />
          </div>
          <div>
            <label className={etiket}>Footer tagline</label>
            <input value={form.footerTagline} onChange={(e) => alanGuncelle("footerTagline", e.target.value)} className={alan} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-body text-sm uppercase tracking-wide text-metin/50 mb-4">SEO</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={etiket}>Site başlığı</label>
            <input value={form.siteBasligi} onChange={(e) => alanGuncelle("siteBasligi", e.target.value)} className={alan} />
          </div>
          <div>
            <label className={etiket}>Site açıklaması</label>
            <textarea value={form.siteAciklamasi} onChange={(e) => alanGuncelle("siteAciklamasi", e.target.value)} rows={2} className={alan + " resize-none"} />
          </div>
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
