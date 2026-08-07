"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { formatFiyat, PARA_BIRIMLERI, PARA_BIRIMI_GOSTERIMLERI, type ParaBirimi, type ParaBirimiGosterimi } from "@/lib/settings";
import { useToast } from "@/components/Toast";

const PARA_BIRIMI_ETIKETI: Record<ParaBirimi, string> = { TRY: "Türk Lirası (₺)", USD: "Amerikan Doları ($)", EUR: "Euro (€)" };
const GOSTERIM_ETIKETI: Record<ParaBirimiGosterimi, string> = {
  ONCE_SEMBOL: "Sembol önce",
  SONRA_SEMBOL: "Sembol sonra",
  KOD: "Kod ile",
};

export default function ParaBirimiForm({
  paraBirimi: baslangicParaBirimi,
  paraBirimiGosterimi: baslangicGosterim,
}: {
  paraBirimi: string;
  paraBirimiGosterimi: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [paraBirimi, setParaBirimi] = useState<ParaBirimi>(baslangicParaBirimi as ParaBirimi);
  const [gosterim, setGosterim] = useState<ParaBirimiGosterimi>(baslangicGosterim as ParaBirimiGosterimi);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch("/api/admin/para-birimi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paraBirimi, paraBirimiGosterimi: gosterim }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Para birimi ayarı kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <p className="text-sm text-metin/60">
        Bu ayar yalnızca fiyatların sitede nasıl <em className="not-italic text-metin/80">gösterileceğini</em>{" "}
        belirler — ödeme her zaman Fiyatlandırma sayfasındaki TL tutarı üzerinden Iyzico ile tahsil edilir.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Para birimi</label>
          <select
            value={paraBirimi}
            onChange={(e) => setParaBirimi(e.target.value as ParaBirimi)}
            className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
          >
            {PARA_BIRIMLERI.map((pb) => (
              <option key={pb} value={pb}>
                {PARA_BIRIMI_ETIKETI[pb]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Önizleme</label>
          <p className="border border-cizgi rounded-lg px-3 py-2.5 bg-kart text-metin font-display font-bold text-sm">
            {formatFiyat(299.9, { paraBirimi, paraBirimiGosterimi: gosterim })}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm text-metin/70 mb-2">Gösterim biçimi</label>
        <div className="flex flex-wrap gap-3">
          {PARA_BIRIMI_GOSTERIMLERI.map((g) => (
            <label
              key={g}
              className={`flex items-center gap-2 border rounded-lg px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                gosterim === g ? "border-vurgu bg-vurgu/10 text-vurgu-dark" : "border-cizgi text-metin/70 hover:border-metin/30"
              }`}
            >
              <input
                type="radio"
                name="gosterim"
                checked={gosterim === g}
                onChange={() => setGosterim(g)}
                className="accent-vurgu"
              />
              {GOSTERIM_ETIKETI[g]}
            </label>
          ))}
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
