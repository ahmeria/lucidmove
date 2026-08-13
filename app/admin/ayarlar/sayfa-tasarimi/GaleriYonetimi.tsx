"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";

interface Gorsel {
  id: string;
  url: string;
  alt: string | null;
  sira: number;
}

function GaleriSatiri({ gorsel }: { gorsel: Gorsel }) {
  const router = useRouter();
  const toast = useToast();
  const [url, setUrl] = useState(gorsel.url);
  const [alt, setAlt] = useState(gorsel.alt ?? "");
  const [sira, setSira] = useState(gorsel.sira);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);

  async function kaydet() {
    setGonderiliyor(true);
    const res = await fetch(`/api/admin/galeri/${gorsel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, alt, sira: Number(sira) }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Görsel güncellendi.");
    router.refresh();
  }

  async function sil() {
    if (!confirm("Bu galeri görselini silmek istediğinize emin misiniz?")) return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/galeri/${gorsel.id}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Görsel silinemedi");
        return;
      }
      toast.success("Görsel silindi.");
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-4 border border-cizgi rounded-lg p-4 bg-zemin">
      <GorselInput value={url} onChange={setUrl} oran={1} />
      <div className="flex-1 min-w-[12rem]">
        <label className="block text-xs text-metin/50 mb-1.5">Alt metin (opsiyonel, erişilebilirlik için)</label>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="ör. Stüdyoda sabah dersi"
          className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-kart text-metin text-sm focus:border-vurgu outline-none"
        />
      </div>
      <label className="flex items-center gap-1.5 text-sm text-metin/70 shrink-0">
        Sıra
        <input
          type="number"
          value={sira}
          onChange={(e) => setSira(Number(e.target.value))}
          className="w-14 border border-cizgi rounded-lg px-2 py-1.5 bg-kart text-metin focus:border-vurgu outline-none"
        />
      </label>
      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={kaydet}
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-4 py-2 rounded-lg text-xs hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={sil}
          disabled={siliniyor}
          className="text-red-700 hover:text-red-900 text-xs disabled:opacity-50 cursor-pointer"
        >
          {siliniyor ? "Siliniyor…" : "Sil"}
        </button>
      </div>
    </div>
  );
}

function YeniGaleriGorseli({ siradakiSira }: { siradakiSira: number }) {
  const router = useRouter();
  const toast = useToast();
  const [acik, setAcik] = useState(false);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url) {
      toast.error("Önce bir görsel yükleyin");
      return;
    }
    setGonderiliyor(true);
    const res = await fetch("/api/admin/galeri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, alt, sira: siradakiSira }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Görsel eklendi.");
    setUrl("");
    setAlt("");
    setAcik(false);
    router.refresh();
  }

  if (!acik) {
    return (
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="w-full border-2 border-dashed border-cizgi text-metin/70 px-4 py-3.5 rounded-2xl text-sm font-medium hover:border-vurgu hover:text-vurgu-dark transition-colors cursor-pointer"
      >
        + Yeni görsel ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-4 border border-cizgi rounded-lg p-4">
      <GorselInput value={url} onChange={setUrl} oran={1} />
      <div className="flex-1 min-w-[12rem]">
        <label className="block text-xs text-metin/50 mb-1.5">Alt metin (opsiyonel, erişilebilirlik için)</label>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="ör. Stüdyoda sabah dersi"
          className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
        />
      </div>
      <div className="flex items-center gap-4 shrink-0">
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

export default function GaleriYonetimi({ gorseller }: { gorseller: Gorsel[] }) {
  const siradakiSira = gorseller.length > 0 ? Math.max(...gorseller.map((g) => g.sira)) + 1 : 0;

  return (
    <div className="space-y-3">
      <p className="text-xs text-metin/45 -mt-1">
        Anasayfadaki &quot;Stüdyodan kareler&quot; bölümünde gösterilir. Görsel yoksa bölüm sayfada hiç görünmez.
      </p>
      {gorseller.map((g) => (
        <GaleriSatiri key={g.id} gorsel={g} />
      ))}
      <YeniGaleriGorseli siradakiSira={siradakiSira} />
    </div>
  );
}
