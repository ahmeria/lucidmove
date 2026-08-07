"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

interface Yorum {
  id: string;
  isim: string;
  rol: string;
  yorum: string;
  sira: number;
}

function YorumSatiri({ yorum }: { yorum: Yorum }) {
  const router = useRouter();
  const toast = useToast();
  const [isim, setIsim] = useState(yorum.isim);
  const [rol, setRol] = useState(yorum.rol);
  const [metin, setMetin] = useState(yorum.yorum);
  const [sira, setSira] = useState(yorum.sira);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);

  async function kaydet() {
    setGonderiliyor(true);
    const res = await fetch(`/api/admin/yorumlar/${yorum.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isim, rol, yorum: metin, sira: Number(sira) }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Yorum güncellendi.");
    router.refresh();
  }

  async function sil() {
    if (!confirm(`"${yorum.isim}" adlı üyenin yorumunu silmek istediğinize emin misiniz?`)) return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/yorumlar/${yorum.id}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Yorum silinemedi");
        return;
      }
      toast.success("Yorum silindi.");
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  return (
    <div className="border border-cizgi rounded-lg p-4 bg-zemin space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-metin/50 mb-1.5">İsim</label>
          <input
            value={isim}
            onChange={(e) => setIsim(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-kart text-metin text-sm focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-metin/50 mb-1.5">Rol / üyelik bilgisi</label>
          <input
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            placeholder="ör. 6 aydır üye"
            className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-kart text-metin text-sm focus:border-vurgu outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-metin/50 mb-1.5">Yorum</label>
        <textarea
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          rows={2}
          className="w-full border border-cizgi rounded-lg px-3 py-2 bg-kart text-metin text-sm focus:border-vurgu outline-none resize-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-1.5 text-sm text-metin/70">
          Sıra
          <input
            type="number"
            value={sira}
            onChange={(e) => setSira(Number(e.target.value))}
            className="w-14 border border-cizgi rounded-lg px-2 py-1.5 bg-kart text-metin focus:border-vurgu outline-none"
          />
        </label>

        <div className="flex items-center gap-4">
          <button
            onClick={kaydet}
            disabled={gonderiliyor}
            className="bg-metin text-zemin px-4 py-2 rounded-lg text-xs hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
          >
            {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <button
            onClick={sil}
            disabled={siliniyor}
            className="text-red-700 hover:text-red-900 text-xs disabled:opacity-50 cursor-pointer"
          >
            {siliniyor ? "Siliniyor…" : "Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

function YeniYorumFormu() {
  const router = useRouter();
  const toast = useToast();
  const [acik, setAcik] = useState(false);
  const [isim, setIsim] = useState("");
  const [rol, setRol] = useState("");
  const [metin, setMetin] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);
    const res = await fetch("/api/admin/yorumlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isim, rol, yorum: metin, sira: 9999 }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Yorum eklendi.");
    setIsim("");
    setRol("");
    setMetin("");
    setAcik(false);
    router.refresh();
  }

  if (!acik) {
    return (
      <button
        onClick={() => setAcik(true)}
        className="border border-cizgi text-metin px-4 py-2.5 rounded-lg text-sm hover:border-vurgu transition-colors cursor-pointer"
      >
        + Yeni yorum ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-cizgi rounded-lg p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={isim}
          onChange={(e) => setIsim(e.target.value)}
          required
          placeholder="İsim (ör. Elif K.)"
          className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
        />
        <input
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          required
          placeholder="Rol / üyelik bilgisi (ör. 6 aydır üye)"
          className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
        />
      </div>
      <textarea
        value={metin}
        onChange={(e) => setMetin(e.target.value)}
        required
        rows={2}
        placeholder="Yorum metni"
        className="w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none resize-none"
      />

      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-4 py-2 rounded-lg text-xs hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Ekleniyor…" : "Ekle"}
        </button>
        <button
          type="button"
          onClick={() => setAcik(false)}
          className="text-metin/50 text-xs hover:text-metin cursor-pointer"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}

export default function YorumYonetimi({ yorumlar }: { yorumlar: Yorum[] }) {
  return (
    <div className="space-y-3">
      {yorumlar.map((y) => (
        <YorumSatiri key={y.id} yorum={y} />
      ))}
      <YeniYorumFormu />
    </div>
  );
}
