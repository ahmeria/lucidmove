"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent, DragEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";
import DilSekmeli from "@/components/admin/DilSekmeli";

interface Mood {
  id: string;
  ad: string;
  adEn: string | null;
  adAz: string | null;
  slug: string;
  gorselUrl: string | null;
  sira: number;
}

// Sürükleme tutamacı — 6 noktalı klasik "grip" simgesi (bkz.
// app/admin/courses/[id]/edit/DersYonetimi.tsx, aynı desen).
function TutamacIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

// Satır her zaman tam açık (Galeri yönetimiyle aynı desen, Dersler'deki gibi
// daraltılmış özet yok) — bu yüzden sürükleme SADECE tutamaç üzerinden
// başlıyor. Aksi halde "Ad" alanında metin seçmeye çalışırken yanlışlıkla
// sürükleme tetiklenirdi.
function MoodSatiri({
  mood,
  suruklenebilir,
  suruklenen,
  suruklemeOlaylari,
}: {
  mood: Mood;
  suruklenebilir: boolean;
  suruklenen: boolean;
  suruklemeOlaylari: {
    onDragStart: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnter: () => void;
    onDragOver: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
  };
}) {
  const router = useRouter();
  const toast = useToast();
  const [ad, setAd] = useState(mood.ad);
  const [adEn, setAdEn] = useState(mood.adEn ?? "");
  const [adAz, setAdAz] = useState(mood.adAz ?? "");
  const [gorselUrl, setGorselUrl] = useState(mood.gorselUrl ?? "");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);

  async function kaydet() {
    setGonderiliyor(true);
    const res = await fetch(`/api/admin/moods/${mood.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, adEn, adAz, gorselUrl, sira: mood.sira }), // sıra burada değişmiyor — sürükleyip bırakarak değişir
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Mood güncellendi.");
    router.refresh();
  }

  async function sil() {
    if (!confirm(`"${mood.ad}" mood'unu silmek istediğinize emin misiniz? Bu etikete sahip dersler etiketsiz kalır.`))
      return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/moods/${mood.id}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Mood silinemedi");
        return;
      }
      toast.success("Mood silindi.");
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  return (
    <div
      onDragEnter={suruklemeOlaylari.onDragEnter}
      onDragOver={suruklemeOlaylari.onDragOver}
      className={`flex flex-wrap items-start gap-4 border rounded-lg p-4 bg-zemin transition-opacity ${
        suruklenen ? "opacity-40 border-vurgu" : "border-cizgi"
      }`}
    >
      {suruklenebilir && (
        <div
          draggable
          onDragStart={suruklemeOlaylari.onDragStart}
          onDragEnd={suruklemeOlaylari.onDragEnd}
          title="Sürükleyip sırala"
          className="self-center shrink-0 flex items-center justify-center size-9 rounded-lg text-metin/25 hover:text-metin/50 cursor-grab active:cursor-grabbing"
        >
          <TutamacIkonu className="size-4" />
        </div>
      )}
      <GorselInput value={gorselUrl} onChange={setGorselUrl} oran={4 / 3} />
      <div className="flex-1 min-w-[12rem]">
        <DilSekmeli etiket="Ad" tr={ad} en={adEn} az={adAz} onTrChange={setAd} onEnChange={setAdEn} onAzChange={setAdAz} />
        <p className="text-[11px] text-metin/40 mt-1.5">
          Kısa kod: <code className="bg-cizgi/50 px-1 py-0.5 rounded">{mood.slug}</code> (sabit — dersler buna göre
          eşleşiyor, ad değişse de bozulmaz)
        </p>
      </div>
      <div className="self-center flex items-center gap-4 shrink-0">
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

function YeniMood({ siradakiSira }: { siradakiSira: number }) {
  const router = useRouter();
  const toast = useToast();
  const [acik, setAcik] = useState(false);
  const [ad, setAd] = useState("");
  const [adEn, setAdEn] = useState("");
  const [adAz, setAdAz] = useState("");
  const [gorselUrl, setGorselUrl] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);
    const res = await fetch("/api/admin/moods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, adEn, adAz, gorselUrl, sira: siradakiSira }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Mood eklendi.");
    setAd("");
    setAdEn("");
    setAdAz("");
    setGorselUrl("");
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
        + Yeni mood ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-4 border border-cizgi rounded-lg p-4">
      <GorselInput value={gorselUrl} onChange={setGorselUrl} oran={4 / 3} />
      <div className="flex-1 min-w-[12rem]">
        <DilSekmeli etiket="Ad" tr={ad} en={adEn} az={adAz} onTrChange={setAd} onEnChange={setAdEn} onAzChange={setAdAz} />
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

export default function MoodYonetimi({ moodlar }: { moodlar: Mood[] }) {
  const router = useRouter();
  const toast = useToast();
  const [liste, setListe] = useState(moodlar);
  const [suruklenenId, setSuruklenenId] = useState<string | null>(null);

  // Sunucudan taze veri geldiğinde (router.refresh() sonrası) yerel listeyi
  // eşitle — bkz. DersYonetimi.tsx'teki aynı desen.
  useEffect(() => {
    setListe(moodlar);
  }, [moodlar]);

  async function siralamayiKaydet(yeniListe: Mood[]) {
    const res = await fetch("/api/admin/moods/sirala", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siraliIdler: yeniListe.map((m) => m.id) }),
    });
    if (!res.ok) {
      toast.error("Sıralama kaydedilemedi");
      setListe(moodlar); // sunucudaki son bilinen sıraya geri dön
      return;
    }
    router.refresh();
  }

  function uzerineGelindi(hedefId: string) {
    if (!suruklenenId || suruklenenId === hedefId) return;
    setListe((mevcut) => {
      const kaynakIndex = mevcut.findIndex((m) => m.id === suruklenenId);
      const hedefIndex = mevcut.findIndex((m) => m.id === hedefId);
      if (kaynakIndex === -1 || hedefIndex === -1) return mevcut;
      const yeni = [...mevcut];
      const [tasinan] = yeni.splice(kaynakIndex, 1);
      yeni.splice(hedefIndex, 0, tasinan);
      return yeni;
    });
  }

  function suruklemeBitti() {
    if (suruklenenId) {
      setListe((mevcut) => {
        siralamayiKaydet(mevcut);
        return mevcut;
      });
    }
    setSuruklenenId(null);
  }

  const siradakiSira = liste.length > 0 ? Math.max(...liste.map((m) => m.sira)) + 1 : 0;

  return (
    <div className="space-y-3">
      <p className="text-xs text-metin/45 -mt-1">
        Herkese açık Kurslar sayfasındaki (/courses) &quot;Moodlar&quot; bölümünde ve ders düzenleme formundaki
        &quot;Mood&quot; seçiminde kullanılır. Görsel eklenmezse kart düz renkle gösterilir.
      </p>
      {liste.length > 1 && (
        <p className="text-xs text-metin/40 flex items-center gap-1.5">
          <TutamacIkonu className="size-3.5" />
          Sırasını değiştirmek için soldaki tutamaçtan sürükleyip bırakın
        </p>
      )}
      {liste.map((m) => (
        <MoodSatiri
          key={m.id}
          mood={m}
          suruklenebilir={liste.length > 1}
          suruklenen={suruklenenId === m.id}
          suruklemeOlaylari={{
            onDragStart: (e) => {
              e.dataTransfer.effectAllowed = "move";
              setSuruklenenId(m.id);
            },
            onDragEnter: () => uzerineGelindi(m.id),
            onDragOver: (e) => e.preventDefault(),
            onDragEnd: suruklemeBitti,
          }}
        />
      ))}
      <YeniMood siradakiSira={siradakiSira} />
    </div>
  );
}
