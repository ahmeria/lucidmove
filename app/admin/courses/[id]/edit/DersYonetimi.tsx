"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, FormEvent, DragEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselKutusu from "@/components/admin/GorselKutusu";
import DilSekmeli from "@/components/admin/DilSekmeli";
import VideoKareSecici from "@/components/admin/VideoKareSecici";
import VideoInput from "../../VideoInput";

interface Ders {
  id: string;
  baslik: string;
  baslikEn: string | null;
  baslikAz: string | null;
  slug: string;
  aciklama: string | null;
  aciklamaEn: string | null;
  aciklamaAz: string | null;
  kapakUrl: string | null;
  sureDakika: number;
  kaynakVideoUrl: string;
  ucretsizMi: boolean;
  mood: string | null;
  sira: number;
}

// Mood'lar artık admin panelinden yönetiliyor (bkz. app/admin/moods) — sabit
// bir liste değil, DersYonetimi'ye üstten (bkz. app/admin/courses/[id]/edit/page.tsx)
// prop olarak geçiriliyor.
interface MoodSecenegi {
  deger: string;
  etiket: string;
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

// Sürükleme tutamacı — 6 noktalı klasik "grip" simgesi.
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

// Görsel + Başlık + İçerik dosyası tek satırda — Slug artık ayrı bir alan
// değil, kaydedilirken başlıktan otomatik türetiliyor (bkz. API route).
//
// Kart daraltılmış (özet) halde açılır — bir kursta çok sayıda ders varken
// hepsinin video seçici/açıklama vb. ile tam açık durması sayfayı kullanışsız
// kılıyordu. Özet satırına tıklanınca düzenleme alanları görünür.
//
// Sıra artık elle bir sayı girilerek değil, kartın sürüklenip bırakılmasıyla
// belirleniyor (bkz. DersYonetimi'ndeki sürükle-bırak durumu) — bu yüzden
// kart açıkken (düzenleme sırasında) sürükleme kasıtlı olarak devre dışı.
function DersSatiri({
  ders,
  courseId,
  pozisyon,
  moodlar,
  suruklenebilir,
  suruklenen,
  suruklemeOlaylari,
}: {
  ders: Ders;
  courseId: string;
  pozisyon: number;
  moodlar: MoodSecenegi[];
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
  const [acik, setAcik] = useState(false);
  const [baslik, setBaslik] = useState(ders.baslik);
  const [baslikEn, setBaslikEn] = useState(ders.baslikEn ?? "");
  const [baslikAz, setBaslikAz] = useState(ders.baslikAz ?? "");
  const [aciklama, setAciklama] = useState(ders.aciklama ?? "");
  const [aciklamaEn, setAciklamaEn] = useState(ders.aciklamaEn ?? "");
  const [aciklamaAz, setAciklamaAz] = useState(ders.aciklamaAz ?? "");
  const [kapakUrl, setKapakUrl] = useState(ders.kapakUrl ?? "");
  const [sureDakika, setSureDakika] = useState(ders.sureDakika);
  const [kaynakVideoUrl, setKaynakVideoUrl] = useState(ders.kaynakVideoUrl);
  const [ucretsizMi, setUcretsizMi] = useState(ders.ucretsizMi);
  const [mood, setMood] = useState(ders.mood ?? "");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);

  async function kaydet() {
    setGonderiliyor(true);
    const res = await fetch(`/api/admin/lessons/${ders.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baslik,
        baslikEn,
        baslikAz,
        aciklama,
        aciklamaEn,
        aciklamaAz,
        kapakUrl,
        sureDakika: Number(sureDakika),
        kaynakVideoUrl,
        ucretsizMi,
        mood: mood || null,
        sira: ders.sira, // sıra burada değişmiyor — bkz. yukarıdaki not
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

  const surukleneblirGorunum = suruklenebilir && !acik;

  return (
    <div
      draggable={surukleneblirGorunum}
      onDragStart={surukleneblirGorunum ? suruklemeOlaylari.onDragStart : undefined}
      onDragEnter={suruklemeOlaylari.onDragEnter}
      onDragOver={suruklemeOlaylari.onDragOver}
      onDragEnd={suruklemeOlaylari.onDragEnd}
      className={`rounded-2xl bg-kart border shadow-organik overflow-hidden transition-opacity ${
        suruklenen ? "opacity-40 border-vurgu" : "border-cizgi"
      }`}
    >
      {/* Özet satırı — daima görünür, tıklanınca düzenleme alanı açılır/kapanır */}
      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        aria-expanded={acik}
        className={`w-full flex items-center gap-3.5 p-4 text-left hover:bg-zemin/60 transition-colors ${
          surukleneblirGorunum ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
        }`}
      >
        {suruklenebilir && <TutamacIkonu className="shrink-0 size-4 text-metin/25" />}
        <span className="shrink-0 flex items-center justify-center size-7 rounded-full bg-vurgu/10 text-vurgu-dark font-mono text-xs font-bold">
          {pozisyon}
        </span>
        <div className="relative shrink-0 size-12 rounded-xl overflow-hidden bg-zemin border border-cizgi">
          {kapakUrl && <Image src={kapakUrl} alt="" fill sizes="48px" draggable={false} className="object-cover" />}
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
              <DilSekmeli
                etiket="Başlık"
                tr={baslik}
                en={baslikEn}
                az={baslikAz}
                onTrChange={setBaslik}
                onEnChange={setBaslikEn}
                onAzChange={setBaslikAz}
              />
              <DilSekmeli
                etiket="Video özeti / içerik bilgisi (opsiyonel)"
                tr={aciklama}
                en={aciklamaEn}
                az={aciklamaAz}
                onTrChange={setAciklama}
                onEnChange={setAciklamaEn}
                onAzChange={setAciklamaAz}
                textarea
                rows={2}
              />
            </div>

            <div className="w-72 shrink-0">
              <label className="block text-xs text-metin/50 mb-1.5">İçerik dosyası</label>
              <VideoInput
                value={kaynakVideoUrl}
                onChange={setKaynakVideoUrl}
                zorunlu
                sadeceYukleme
                onSureAlgila={setSureDakika}
              />
              {kaynakVideoUrl.startsWith("/uploads/") && (
                <VideoKareSecici videoUrl={kaynakVideoUrl} onSecildi={setKapakUrl} oran={4 / 3} />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
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
              <label className="flex items-center gap-1.5 text-metin/70">
                Mood
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="border border-cizgi rounded-lg px-2 py-1.5 bg-zemin text-metin focus:border-vurgu outline-none"
                >
                  <option value="">Seçilmedi</option>
                  {moodlar.map((m) => (
                    <option key={m.deger} value={m.deger}>
                      {m.etiket}
                    </option>
                  ))}
                </select>
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

function YeniDersFormu({ courseId, moodlar }: { courseId: string; moodlar: MoodSecenegi[] }) {
  const router = useRouter();
  const toast = useToast();
  const [acik, setAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [baslikEn, setBaslikEn] = useState("");
  const [baslikAz, setBaslikAz] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [aciklamaEn, setAciklamaEn] = useState("");
  const [aciklamaAz, setAciklamaAz] = useState("");
  const [kapakUrl, setKapakUrl] = useState("");
  const [sureDakika, setSureDakika] = useState(10);
  const [kaynakVideoUrl, setKaynakVideoUrl] = useState("");
  const [ucretsizMi, setUcretsizMi] = useState(false);
  const [mood, setMood] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);
    const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baslik,
        baslikEn,
        baslikAz,
        aciklama,
        aciklamaEn,
        aciklamaAz,
        kapakUrl,
        sureDakika: Number(sureDakika),
        kaynakVideoUrl,
        ucretsizMi,
        mood: mood || null,
      }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Ders eklendi.");
    setBaslik("");
    setBaslikEn("");
    setBaslikAz("");
    setAciklama("");
    setAciklamaEn("");
    setAciklamaAz("");
    setKapakUrl("");
    setKaynakVideoUrl("");
    setSureDakika(10);
    setUcretsizMi(false);
    setMood("");
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
          <DilSekmeli
            etiket="Başlık"
            tr={baslik}
            en={baslikEn}
            az={baslikAz}
            onTrChange={setBaslik}
            onEnChange={setBaslikEn}
            onAzChange={setBaslikAz}
          />
          <DilSekmeli
            etiket="Video özeti / içerik bilgisi (opsiyonel)"
            tr={aciklama}
            en={aciklamaEn}
            az={aciklamaAz}
            onTrChange={setAciklama}
            onEnChange={setAciklamaEn}
            onAzChange={setAciklamaAz}
            textarea
            rows={2}
          />
        </div>

        <div className="w-72 shrink-0">
          <label className="block text-xs text-metin/50 mb-1.5">İçerik dosyası</label>
          <VideoInput
            value={kaynakVideoUrl}
            onChange={setKaynakVideoUrl}
            zorunlu
            sadeceYukleme
            onSureAlgila={setSureDakika}
          />
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
          <label className="flex items-center gap-1.5 text-metin/70">
            Mood
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="border border-cizgi rounded-lg px-2 py-1.5 bg-zemin text-metin focus:border-vurgu outline-none"
            >
              <option value="">Seçilmedi</option>
              {moodlar.map((m) => (
                <option key={m.deger} value={m.deger}>
                  {m.etiket}
                </option>
              ))}
            </select>
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

export default function DersYonetimi({
  courseId,
  dersler,
  moodlar,
}: {
  courseId: string;
  dersler: Ders[];
  moodlar: MoodSecenegi[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [liste, setListe] = useState(dersler);
  const [suruklenenId, setSuruklenenId] = useState<string | null>(null);

  // Sunucudan taze veri geldiğinde (router.refresh() sonrası) yerel listeyi
  // eşitle — ör. yeni eklenen/silinen bir ders veya başka bir sekmeden gelen
  // değişiklik burada da yansısın.
  useEffect(() => {
    setListe(dersler);
  }, [dersler]);

  async function siralamayiKaydet(yeniListe: Ders[]) {
    const res = await fetch(`/api/admin/courses/${courseId}/lessons/sirala`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siraliIdler: yeniListe.map((d) => d.id) }),
    });
    if (!res.ok) {
      toast.error("Sıralama kaydedilemedi");
      setListe(dersler); // sunucudaki son bilinen sıraya geri dön
      return;
    }
    router.refresh();
  }

  // Sürüklenen kart, üzerine gelinen kartın konumuna anında taşınır
  // (bırakılmayı beklemeden) — klasik sürükle-bırak liste deseni. Kalıcı
  // kayıt yalnızca sürükleme bittiğinde (onDragEnd) bir kez tetiklenir.
  function uzerineGelindi(hedefId: string) {
    if (!suruklenenId || suruklenenId === hedefId) return;
    setListe((mevcut) => {
      const kaynakIndex = mevcut.findIndex((d) => d.id === suruklenenId);
      const hedefIndex = mevcut.findIndex((d) => d.id === hedefId);
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

  return (
    <div className="space-y-3">
      {liste.length > 1 && (
        <p className="text-xs text-metin/40 flex items-center gap-1.5 -mt-1">
          <TutamacIkonu className="size-3.5" />
          Sırasını değiştirmek için kartları sürükleyip bırakın
        </p>
      )}
      {liste.map((d, i) => (
        <DersSatiri
          key={d.id}
          ders={d}
          courseId={courseId}
          pozisyon={i + 1}
          moodlar={moodlar}
          suruklenebilir={liste.length > 1}
          suruklenen={suruklenenId === d.id}
          suruklemeOlaylari={{
            onDragStart: (e) => {
              e.dataTransfer.effectAllowed = "move";
              setSuruklenenId(d.id);
            },
            onDragEnter: () => uzerineGelindi(d.id),
            onDragOver: (e) => e.preventDefault(),
            onDragEnd: suruklemeBitti,
          }}
        />
      ))}
      <YeniDersFormu courseId={courseId} moodlar={moodlar} />
    </div>
  );
}
