"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";
import DilSekmeli from "@/components/admin/DilSekmeli";
import VideoKareSecici from "@/components/admin/VideoKareSecici";
import VideoInput from "../courses/VideoInput";

const alan = "w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

interface OzelDersFormProps {
  ders?: {
    id: string;
    baslik: string;
    baslikEn: string | null;
    baslikAz: string | null;
    aciklama: string;
    aciklamaEn: string | null;
    aciklamaAz: string | null;
    kapakUrl: string | null;
    tanitimVideoUrl: string | null;
    fiyat: string; // Decimal.toString()
    yayindaMi: boolean;
  };
}

export default function OzelDersForm({ ders }: OzelDersFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [baslik, setBaslik] = useState(ders?.baslik ?? "");
  const [baslikEn, setBaslikEn] = useState(ders?.baslikEn ?? "");
  const [baslikAz, setBaslikAz] = useState(ders?.baslikAz ?? "");
  const [aciklama, setAciklama] = useState(ders?.aciklama ?? "");
  const [aciklamaEn, setAciklamaEn] = useState(ders?.aciklamaEn ?? "");
  const [aciklamaAz, setAciklamaAz] = useState(ders?.aciklamaAz ?? "");
  const [kapakUrl, setKapakUrl] = useState(ders?.kapakUrl ?? "");
  const [tanitimVideoUrl, setTanitimVideoUrl] = useState(ders?.tanitimVideoUrl ?? "");
  const [fiyat, setFiyat] = useState(ders?.fiyat ?? "");
  const [yayindaMi, setYayindaMi] = useState(ders?.yayindaMi ?? true);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const govde = {
      baslik,
      baslikEn,
      baslikAz,
      aciklama,
      aciklamaEn,
      aciklamaAz,
      kapakUrl,
      tanitimVideoUrl,
      fiyat: Number(fiyat),
      yayindaMi,
    };
    const url = ders ? `/api/admin/private-lessons/${ders.id}` : "/api/admin/private-lessons";
    const method = ders ? "PATCH" : "POST";

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
      toast.success(ders ? "Özel ders güncellendi." : "Özel ders oluşturuldu.");
      router.push(ders ? `/admin/private-lessons/${ders.id}/edit` : `/admin/private-lessons/${veri.ders.id}/edit`);
      router.refresh();
    } catch {
      toast.error("Bir hata oluştu");
      setGonderiliyor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
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
        etiket="Açıklama"
        tr={aciklama}
        en={aciklamaEn}
        az={aciklamaAz}
        onTrChange={setAciklama}
        onEnChange={setAciklamaEn}
        onAzChange={setAciklamaAz}
        textarea
        rows={4}
      />

      <div>
        <label className={etiket}>Fiyat (₺)</label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={fiyat}
          onChange={(e) => setFiyat(e.target.value)}
          required
          className={alan + " w-full sm:w-64"}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <label className={etiket}>Kapak görseli (opsiyonel)</label>
          <GorselInput value={kapakUrl} onChange={setKapakUrl} oran={4 / 3} />
        </div>
        <div>
          <label className={etiket}>Tanıtım videosu (opsiyonel)</label>
          <VideoInput value={tanitimVideoUrl} onChange={setTanitimVideoUrl} temizlenebilir />
          {tanitimVideoUrl.startsWith("/uploads/") && (
            <VideoKareSecici videoUrl={tanitimVideoUrl} onSecildi={setKapakUrl} oran={4 / 3} />
          )}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-metin/80 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={yayindaMi}
          onChange={(e) => setYayindaMi(e.target.checked)}
          className="size-4 accent-vurgu cursor-pointer"
        />
        Yayında (anasayfada ve özel ders sayfasında görünür)
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : ders ? "Kaydet" : "Özel dersi oluştur"}
        </button>
      </div>
    </form>
  );
}
