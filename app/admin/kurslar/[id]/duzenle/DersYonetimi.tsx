"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselKutusu from "@/components/admin/GorselKutusu";
import VideoKareSecici from "@/components/admin/VideoKareSecici";
import VideoInput from "../../VideoInput";

type FiligranDurumu = "BEKLIYOR" | "ISLENIYOR" | "HAZIR" | "HATA";

interface Ders {
  id: string;
  baslik: string;
  slug: string;
  aciklama: string | null;
  kapakUrl: string | null;
  sureDakika: number;
  kaynakVideoUrl: string;
  filigranDurumu: FiligranDurumu;
  ucretsizMi: boolean;
  sira: number;
}

const FILIGRAN_ETIKETI: Record<FiligranDurumu, { metin: string; sinif: string }> = {
  BEKLIYOR: { metin: "Bekliyor", sinif: "bg-metin/10 text-metin/60" },
  ISLENIYOR: { metin: "Filigranlanıyor…", sinif: "bg-amber-100 text-amber-800" },
  HAZIR: { metin: "Hazır", sinif: "bg-emerald-100 text-emerald-800" },
  HATA: { metin: "Hata — tekrar yükleyin", sinif: "bg-hata/10 text-hata" },
};

function FiligranRozeti({ durum }: { durum: FiligranDurumu }) {
  const { metin, sinif } = FILIGRAN_ETIKETI[durum];
  return (
    <span className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${sinif}`}>{metin}</span>
  );
}

// Görsel + Başlık + İçerik dosyası tek satırda — Slug artık ayrı bir alan
// değil, kaydedilirken başlıktan otomatik türetiliyor (bkz. API route).
function DersSatiri({ ders, courseId }: { ders: Ders; courseId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [baslik, setBaslik] = useState(ders.baslik);
  const [aciklama, setAciklama] = useState(ders.aciklama ?? "");
  const [kapakUrl, setKapakUrl] = useState(ders.kapakUrl ?? "");
  const [sureDakika, setSureDakika] = useState(ders.sureDakika);
  const [kaynakVideoUrl, setKaynakVideoUrl] = useState(ders.kaynakVideoUrl);
  const [ucretsizMi, setUcretsizMi] = useState(ders.ucretsizMi);
  const [sira, setSira] = useState(ders.sira);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);

  async function kaydet() {
    setGonderiliyor(true);
    const res = await fetch(`/api/admin/dersler/${ders.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baslik,
        aciklama,
        kapakUrl,
        sureDakika: Number(sureDakika),
        kaynakVideoUrl,
        ucretsizMi,
        sira: Number(sira),
      }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Ders güncellendi.");
    router.refresh();
  }

  async function sil() {
    if (!confirm(`"${ders.baslik}" dersini silmek istediğinize emin misiniz?`)) return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/dersler/${ders.id}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Ders silinemedi");
        return;
      }
      toast.success("Ders silindi.");
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  return (
    <div className="border border-cizgi rounded-lg p-4 bg-zemin space-y-3">
      <div className="flex gap-4 items-start">
        <GorselKutusu value={kapakUrl} onChange={setKapakUrl} boyutSinifi="size-40" />

        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <label className="block text-xs text-metin/50 mb-1.5">Başlık</label>
            <input
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              aria-label="Ders başlığı"
              className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-kart text-metin text-sm focus:border-vurgu outline-none"
              placeholder="Başlık"
            />
          </div>
          <textarea
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            rows={2}
            aria-label="Video özeti / içerik bilgisi"
            placeholder="Video özeti / içerik bilgisi (opsiyonel)"
            className="w-full border border-cizgi rounded-lg px-3 py-2 bg-kart text-metin text-sm focus:border-vurgu outline-none resize-none"
          />
        </div>

        <div className="w-72 shrink-0">
          <label className="block text-xs text-metin/50 mb-1.5">İçerik dosyası</label>
          <VideoInput value={kaynakVideoUrl} onChange={setKaynakVideoUrl} zorunlu sadeceYukleme />
          {kaynakVideoUrl.startsWith("/uploads/") && (
            <VideoKareSecici videoUrl={kaynakVideoUrl} onSecildi={setKapakUrl} />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5 text-metin/70">
            Sıra
            <input
              type="number"
              value={sira}
              onChange={(e) => setSira(Number(e.target.value))}
              className="w-14 border border-cizgi rounded-lg px-2 py-1.5 bg-kart text-metin focus:border-vurgu outline-none"
            />
          </label>
          <FiligranRozeti durum={ders.filigranDurumu} />
          <label className="flex items-center gap-1.5 text-metin/70">
            Süre (dk)
            <input
              type="number"
              value={sureDakika}
              onChange={(e) => setSureDakika(Number(e.target.value))}
              className="w-14 border border-cizgi rounded-lg px-2 py-1.5 bg-kart text-metin focus:border-vurgu outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 text-metin/70">
            <input type="checkbox" checked={ucretsizMi} onChange={(e) => setUcretsizMi(e.target.checked)} />
            Ücretsiz tanıtım
          </label>
        </div>

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

function YeniDersFormu({ courseId }: { courseId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [acik, setAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [kapakUrl, setKapakUrl] = useState("");
  const [sureDakika, setSureDakika] = useState(10);
  const [kaynakVideoUrl, setKaynakVideoUrl] = useState("");
  const [ucretsizMi, setUcretsizMi] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);
    const res = await fetch(`/api/admin/kurslar/${courseId}/dersler`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baslik, aciklama, kapakUrl, sureDakika: Number(sureDakika), kaynakVideoUrl, ucretsizMi }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Ders eklendi.");
    setBaslik("");
    setAciklama("");
    setKapakUrl("");
    setKaynakVideoUrl("");
    setSureDakika(10);
    setUcretsizMi(false);
    setAcik(false);
    router.refresh();
  }

  if (!acik) {
    return (
      <button
        onClick={() => setAcik(true)}
        className="border border-cizgi text-metin px-4 py-2.5 rounded-lg text-sm hover:border-vurgu transition-colors cursor-pointer"
      >
        + Yeni ders ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-cizgi rounded-lg p-4 space-y-3">
      <div className="flex gap-4 items-start">
        <GorselKutusu value={kapakUrl} onChange={setKapakUrl} boyutSinifi="size-40" />

        <div className="flex-1 min-w-0 space-y-3">
          <input
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            required
            aria-label="Ders başlığı"
            placeholder="Başlık"
            className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
          />
          <textarea
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            rows={2}
            aria-label="Video özeti / içerik bilgisi"
            placeholder="Video özeti / içerik bilgisi (opsiyonel)"
            className="w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none resize-none"
          />
        </div>

        <div className="w-72 shrink-0">
          <label className="block text-xs text-metin/50 mb-1.5">İçerik dosyası</label>
          <VideoInput value={kaynakVideoUrl} onChange={setKaynakVideoUrl} zorunlu sadeceYukleme />
          {kaynakVideoUrl.startsWith("/uploads/") && (
            <VideoKareSecici videoUrl={kaynakVideoUrl} onSecildi={setKapakUrl} />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5 text-metin/70">
            Süre (dk)
            <input
              type="number"
              value={sureDakika}
              onChange={(e) => setSureDakika(Number(e.target.value))}
              className="w-14 border border-cizgi rounded-lg px-2 py-1.5 bg-zemin text-metin focus:border-vurgu outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 text-metin/70">
            <input type="checkbox" checked={ucretsizMi} onChange={(e) => setUcretsizMi(e.target.checked)} />
            Ücretsiz tanıtım
          </label>
        </div>

        <div className="flex items-center gap-4">
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
      </div>
    </form>
  );
}

export default function DersYonetimi({ courseId, dersler }: { courseId: string; dersler: Ders[] }) {
  return (
    <div className="space-y-3">
      {dersler.map((d) => (
        <DersSatiri key={d.id} ders={d} courseId={courseId} />
      ))}
      <YeniDersFormu courseId={courseId} />
    </div>
  );
}
