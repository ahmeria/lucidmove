"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import Kart from "@/components/admin/Kart";

interface Plan {
  id: string;
  plan: string;
  baslik: string;
  fiyat: string;
  periyot: string;
  aciklama: string;
  ozellikler: string;
  rozet: string | null;
  vurgulu: boolean;
  sira: number;
}

export default function FiyatForm({ plan }: { plan: Plan }) {
  const router = useRouter();
  const toast = useToast();
  const [baslik, setBaslik] = useState(plan.baslik);
  const [fiyat, setFiyat] = useState(plan.fiyat);
  const [periyot, setPeriyot] = useState(plan.periyot);
  const [aciklama, setAciklama] = useState(plan.aciklama);
  const [ozellikler, setOzellikler] = useState(plan.ozellikler);
  const [rozet, setRozet] = useState(plan.rozet ?? "");
  const [vurgulu, setVurgulu] = useState(plan.vurgulu);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch(`/api/admin/fiyatlar/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baslik,
        fiyat: Number(fiyat),
        periyot,
        aciklama,
        ozellikler,
        rozet: rozet || null,
        vurgulu,
        sira: plan.sira,
      }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Fiyat planı kaydedildi.");
    router.refresh();
  }

  return (
    <Kart>
    <form onSubmit={handleSubmit} className="space-y-4 font-body">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-metin">{plan.plan}</h3>
        <label className="flex items-center gap-1.5 text-sm text-metin/70">
          <input type="checkbox" checked={vurgulu} onChange={(e) => setVurgulu(e.target.checked)} />
          Öne çıkan plan
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Başlık</label>
          <input
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Fiyat (₺)</label>
          <input
            type="number"
            step="0.01"
            value={fiyat}
            onChange={(e) => setFiyat(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Periyot</label>
          <input
            value={periyot}
            onChange={(e) => setPeriyot(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Rozet (opsiyonel)</label>
          <input
            value={rozet}
            onChange={(e) => setRozet(e.target.value)}
            placeholder="ör. 2 ay hediye"
            className="w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Açıklama</label>
        <input
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          className="w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Özellikler (satır satır)</label>
        <textarea
          value={ozellikler}
          onChange={(e) => setOzellikler(e.target.value)}
          rows={4}
          className="w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-5 py-2.5 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
    </Kart>
  );
}
