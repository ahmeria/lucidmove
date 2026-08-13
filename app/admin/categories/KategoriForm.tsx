"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

interface KategoriFormProps {
  kategori?: {
    id: string;
    ad: string;
    slug: string;
    aciklama: string | null;
    sira: number;
  };
}

// Slug artık ayrı bir alan değil, kaydedilirken addan otomatik türetiliyor
// (bkz. API route) — tüm site genelinde uygulanan aynı desen (bkz. dersler).
export default function KategoriForm({ kategori }: KategoriFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [ad, setAd] = useState(kategori?.ad ?? "");
  const [aciklama, setAciklama] = useState(kategori?.aciklama ?? "");
  const [sira, setSira] = useState(kategori?.sira ?? 0);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const govde = { ad, aciklama, sira: Number(sira) };
    const url = kategori ? `/api/admin/categories/${kategori.id}` : "/api/admin/categories";
    const method = kategori ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(govde),
      });
      const veri = await res.json();
      if (!res.ok) {
        toast.error(veri.hata || "Bir hata oluştu");
        setGonderiliyor(false);
        return;
      }
      toast.success(kategori ? "Kategori güncellendi." : "Kategori oluşturuldu.");
      router.push("/admin/categories");
      router.refresh();
    } catch {
      toast.error("Bir hata oluştu");
      setGonderiliyor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Ad</label>
        <input
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          required
          className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Açıklama (opsiyonel)</label>
        <textarea
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          rows={3}
          className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Sıra</label>
        <input
          type="number"
          value={sira}
          onChange={(e) => setSira(Number(e.target.value))}
          className="w-32 border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : kategori ? "Kaydet" : "Kategori oluştur"}
        </button>
      </div>
    </form>
  );
}
