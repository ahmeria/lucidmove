"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import Kart from "@/components/admin/Kart";
import DilSekmeli from "@/components/admin/DilSekmeli";

interface Plan {
  id: string;
  plan: string;
  baslik: string;
  baslikEn: string | null;
  baslikAz: string | null;
  fiyat: string;
  periyot: string;
  periyotEn: string | null;
  periyotAz: string | null;
  aciklama: string;
  aciklamaEn: string | null;
  aciklamaAz: string | null;
  ozellikler: string;
  ozelliklerEn: string | null;
  ozelliklerAz: string | null;
  rozet: string | null;
  rozetEn: string | null;
  rozetAz: string | null;
  vurgulu: boolean;
  sira: number;
}

function bos(v: string | null): string {
  return v ?? "";
}

export default function FiyatForm({ plan }: { plan: Plan }) {
  const router = useRouter();
  const toast = useToast();
  const [baslik, setBaslik] = useState(plan.baslik);
  const [baslikEn, setBaslikEn] = useState(bos(plan.baslikEn));
  const [baslikAz, setBaslikAz] = useState(bos(plan.baslikAz));
  const [fiyat, setFiyat] = useState(plan.fiyat);
  const [periyot, setPeriyot] = useState(plan.periyot);
  const [periyotEn, setPeriyotEn] = useState(bos(plan.periyotEn));
  const [periyotAz, setPeriyotAz] = useState(bos(plan.periyotAz));
  const [aciklama, setAciklama] = useState(plan.aciklama);
  const [aciklamaEn, setAciklamaEn] = useState(bos(plan.aciklamaEn));
  const [aciklamaAz, setAciklamaAz] = useState(bos(plan.aciklamaAz));
  const [ozellikler, setOzellikler] = useState(plan.ozellikler);
  const [ozelliklerEn, setOzelliklerEn] = useState(bos(plan.ozelliklerEn));
  const [ozelliklerAz, setOzelliklerAz] = useState(bos(plan.ozelliklerAz));
  const [rozet, setRozet] = useState(plan.rozet ?? "");
  const [rozetEn, setRozetEn] = useState(bos(plan.rozetEn));
  const [rozetAz, setRozetAz] = useState(bos(plan.rozetAz));
  const [vurgulu, setVurgulu] = useState(plan.vurgulu);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch(`/api/admin/prices/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baslik,
        baslikEn,
        baslikAz,
        fiyat: Number(fiyat),
        periyot,
        periyotEn,
        periyotAz,
        aciklama,
        aciklamaEn,
        aciklamaAz,
        ozellikler,
        ozelliklerEn,
        ozelliklerAz,
        rozet: rozet || null,
        rozetEn,
        rozetAz,
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
          <DilSekmeli
            etiket="Başlık"
            tr={baslik}
            en={baslikEn}
            az={baslikAz}
            onTrChange={setBaslik}
            onEnChange={setBaslikEn}
            onAzChange={setBaslikAz}
          />
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
          <DilSekmeli
            etiket="Periyot"
            tr={periyot}
            en={periyotEn}
            az={periyotAz}
            onTrChange={setPeriyot}
            onEnChange={setPeriyotEn}
            onAzChange={setPeriyotAz}
          />
          <DilSekmeli
            etiket="Rozet (opsiyonel)"
            tr={rozet}
            en={rozetEn}
            az={rozetAz}
            onTrChange={setRozet}
            onEnChange={setRozetEn}
            onAzChange={setRozetAz}
          />
        </div>
        <DilSekmeli
          etiket="Açıklama"
          tr={aciklama}
          en={aciklamaEn}
          az={aciklamaAz}
          onTrChange={setAciklama}
          onEnChange={setAciklamaEn}
          onAzChange={setAciklamaAz}
        />
        <DilSekmeli
          etiket="Özellikler (satır satır)"
          tr={ozellikler}
          en={ozelliklerEn}
          az={ozelliklerAz}
          onTrChange={setOzellikler}
          onEnChange={setOzelliklerEn}
          onAzChange={setOzelliklerAz}
          textarea
          rows={4}
        />

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
