"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";
import DilSekmeli from "@/components/admin/DilSekmeli";

const alan = "w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

// Date -> "YYYY-MM-DD" (input[type=date] biçimi).
function tarihGirdisi(tarih: Date): string {
  return tarih.toISOString().slice(0, 10);
}

interface CampFormProps {
  kamp?: {
    id: string;
    ad: string;
    adEn: string | null;
    adAz: string | null;
    yer: string;
    yerEn: string | null;
    yerAz: string | null;
    detaylar: string;
    detaylarEn: string | null;
    detaylarAz: string | null;
    baslangicTarihi: Date;
    bitisTarihi: Date;
    kapasite: number;
    fiyat: string; // Decimal.toString()
    rezervasyonSuresiGun: number;
    kapakUrl: string | null;
    yayindaMi: boolean;
  };
}

export default function CampForm({ kamp }: CampFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [ad, setAd] = useState(kamp?.ad ?? "");
  const [adEn, setAdEn] = useState(kamp?.adEn ?? "");
  const [adAz, setAdAz] = useState(kamp?.adAz ?? "");
  const [yer, setYer] = useState(kamp?.yer ?? "");
  const [yerEn, setYerEn] = useState(kamp?.yerEn ?? "");
  const [yerAz, setYerAz] = useState(kamp?.yerAz ?? "");
  const [detaylar, setDetaylar] = useState(kamp?.detaylar ?? "");
  const [detaylarEn, setDetaylarEn] = useState(kamp?.detaylarEn ?? "");
  const [detaylarAz, setDetaylarAz] = useState(kamp?.detaylarAz ?? "");
  const [baslangicTarihi, setBaslangicTarihi] = useState(kamp ? tarihGirdisi(kamp.baslangicTarihi) : "");
  const [bitisTarihi, setBitisTarihi] = useState(kamp ? tarihGirdisi(kamp.bitisTarihi) : "");
  const [kapasite, setKapasite] = useState(String(kamp?.kapasite ?? 10));
  const [fiyat, setFiyat] = useState(kamp?.fiyat ?? "");
  const [rezervasyonSuresiGun, setRezervasyonSuresiGun] = useState(String(kamp?.rezervasyonSuresiGun ?? 3));
  const [kapakUrl, setKapakUrl] = useState(kamp?.kapakUrl ?? "");
  const [yayindaMi, setYayindaMi] = useState(kamp?.yayindaMi ?? true);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (bitisTarihi < baslangicTarihi) {
      toast.error("Bitiş tarihi başlangıçtan önce olamaz");
      return;
    }

    setGonderiliyor(true);

    const govde = {
      ad,
      adEn,
      adAz,
      yer,
      yerEn,
      yerAz,
      detaylar,
      detaylarEn,
      detaylarAz,
      baslangicTarihi,
      bitisTarihi,
      kapasite: Number(kapasite),
      fiyat: Number(fiyat),
      rezervasyonSuresiGun: Number(rezervasyonSuresiGun),
      kapakUrl,
      yayindaMi,
    };
    const url = kamp ? `/api/admin/camps/${kamp.id}` : "/api/admin/camps";
    const method = kamp ? "PATCH" : "POST";

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
      toast.success(kamp ? "Kamp güncellendi." : "Kamp oluşturuldu.");
      router.push(kamp ? `/admin/camps/${kamp.id}/edit` : `/admin/camps/${veri.kamp.id}/edit`);
      router.refresh();
    } catch {
      toast.error("Bir hata oluştu");
      setGonderiliyor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <DilSekmeli etiket="Kamp adı" tr={ad} en={adEn} az={adAz} onTrChange={setAd} onEnChange={setAdEn} onAzChange={setAdAz} />
      <DilSekmeli
        etiket="Yer"
        tr={yer}
        en={yerEn}
        az={yerAz}
        onTrChange={setYer}
        onEnChange={setYerEn}
        onAzChange={setYerAz}
      />
      <DilSekmeli
        etiket="Detaylar"
        tr={detaylar}
        en={detaylarEn}
        az={detaylarAz}
        onTrChange={setDetaylar}
        onEnChange={setDetaylarEn}
        onAzChange={setDetaylarAz}
        textarea
        rows={5}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={etiket}>Başlangıç tarihi</label>
          <input
            type="date"
            value={baslangicTarihi}
            onChange={(e) => setBaslangicTarihi(e.target.value)}
            required
            className={alan}
          />
        </div>
        <div>
          <label className={etiket}>Bitiş tarihi</label>
          <input
            type="date"
            value={bitisTarihi}
            onChange={(e) => setBitisTarihi(e.target.value)}
            required
            className={alan}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={etiket}>Kontenjan</label>
          <input
            type="number"
            min={1}
            step={1}
            value={kapasite}
            onChange={(e) => setKapasite(e.target.value)}
            required
            className={alan}
          />
        </div>
        <div>
          <label className={etiket}>Fiyat (₺)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={fiyat}
            onChange={(e) => setFiyat(e.target.value)}
            required
            className={alan}
          />
        </div>
        <div>
          <label className={etiket}>Rezervasyon süresi (gün)</label>
          <input
            type="number"
            min={1}
            step={1}
            value={rezervasyonSuresiGun}
            onChange={(e) => setRezervasyonSuresiGun(e.target.value)}
            required
            className={alan}
          />
        </div>
      </div>
      <p className="text-xs text-metin/45 -mt-3">
        &quot;Rezervasyon yap&quot;ı seçen bir üyenin ödemeyi tamamlaması için tanınan süre — bu kampa özeldir, süre
        dolunca üyenin yeri otomatik serbest kalır.
      </p>

      <div>
        <label className={etiket}>Kapak görseli (opsiyonel)</label>
        <GorselInput value={kapakUrl} onChange={setKapakUrl} oran={4 / 3} />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-metin/80 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={yayindaMi}
          onChange={(e) => setYayindaMi(e.target.checked)}
          className="size-4 accent-vurgu cursor-pointer"
        />
        Yayında (anasayfada ve kamp sayfasında görünür)
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : kamp ? "Kaydet" : "Kampı oluştur"}
        </button>
      </div>
    </form>
  );
}
