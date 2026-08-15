"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselKutusu from "@/components/admin/GorselKutusu";
import VideoKareSecici from "@/components/admin/VideoKareSecici";
import VideoInput from "../../VideoInput";

interface Ders {
  id: string;
  baslik: string;
  slug: string;
  aciklama: string | null;
  kapakUrl: string | null;
  sureDakika: number;
  kaynakVideoUrl: string;
  ucretsizMi: boolean;
  sira: number;
}

function OkIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m7 9.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l.8 12.2a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Görsel + Başlık + İçerik dosyası tek satırda — Slug artık ayrı bir alan
// değil, kaydedilirken başlıktan otomatik türetiliyor (bkz. API route).
//
// Kart daraltılmış (özet) halde açılır — bir kursta çok sayıda ders varken
// hepsinin video seçici/açıklama vb. ile tam açık durması sayfayı kullanışsız
// kılıyordu. Özet satırına tıklanınca düzenleme alanları görünür.
function DersSatiri({ ders, courseId }: { ders: Ders; courseId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [acik, setAcik] = useState(false);
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
    const res = await fetch(`/api/admin/lessons/${ders.id}`, {
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
      const res = await fetch(`/api/admin/lessons/${ders.id}`, { method: "DELETE" });
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
    <div className="rounded-2xl bg-kart border border-cizgi shadow-organik overflow-hidden">
      {/* Özet satırı — daima görünür, tıklanınca düzenleme alanı açılır/kapanır */}
      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        aria-expanded={acik}
        className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-zemin/60 transition-colors cursor-pointer"
      >
        <span className="shrink-0 flex items-center justify-center size-7 rounded-full bg-vurgu/10 text-vurgu-dark font-mono text-xs font-bold">
          {sira}
        </span>
        <div className="relative shrink-0 size-12 rounded-xl overflow-hidden bg-zemin border border-cizgi">
          {kapakUrl && <Image src={kapakUrl} alt="" fill sizes="48px" className="object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-metin truncate">{baslik || "(Başlıksız ders)"}</p>
          <p className="text-xs text-metin/50 mt-0.5">{sureDakika} dk</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ucretsizMi && (
            <span className="font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-ikincil/10 text-ikincil whitespace-nowrap">
              Ücretsiz
            </span>
          )}
          <OkIkonu className={`size-4 text-metin/40 transition-transform ${acik ? "rotate-180" : ""}`} />
        </div>
      </button>

      {acik && (
        <div className="border-t border-cizgi p-4 space-y-3">
          <div className="flex gap-4 items-start">
            <GorselKutusu value={kapakUrl} onChange={setKapakUrl} boyutSinifi="size-40" oran={4 / 3} />

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <label className="block text-xs text-metin/50 mb-1.5">Başlık</label>
                <input
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                  aria-label="Ders başlığı"
                  className="w-full border border-cizgi rounded-lg px-3 py-2.5 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
                  placeholder="Başlık"
                />
              </div>
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
                <VideoKareSecici videoUrl={kaynakVideoUrl} onSecildi={setKapakUrl} oran={4 / 3} />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-1.5 text-metin/70">
                Sıra
                <input
                  type="number"
                  value={sira}
                  onChange={(e) => setSira(Number(e.target.value))}
                  className="w-14 border border-cizgi rounded-lg px-2 py-1.5 bg-zemin text-metin focus:border-vurgu outline-none"
                />
              </label>
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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={sil}
                disabled={siliniyor}
                title="Dersi sil"
                aria-label="Dersi sil"
                className="flex items-center justify-center size-9 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <CopIkonu className="size-4" />
              </button>
              <button
                type="button"
                onClick={kaydet}
                disabled={gonderiliyor}
                className="bg-metin text-zemin px-5 py-2.5 rounded-lg text-xs font-medium hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
              >
                {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
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
        type="button"
        onClick={() => setAcik(true)}
        className="w-full border-2 border-dashed border-cizgi text-metin/70 px-4 py-3.5 rounded-2xl text-sm font-medium hover:border-vurgu hover:text-vurgu-dark transition-colors cursor-pointer"
      >
        + Yeni ders ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-kart border border-cizgi shadow-organik p-4 space-y-3">
      <div className="flex gap-4 items-start">
        <GorselKutusu value={kapakUrl} onChange={setKapakUrl} boyutSinifi="size-40" oran={4 / 3} />

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
