"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";
import DilSekmeli from "@/components/admin/DilSekmeli";
import VideoKareSecici from "@/components/admin/VideoKareSecici";
import VideoInput from "./VideoInput";

const SEVIYELER = ["Başlangıç", "Orta", "İleri", "Tüm seviyeler"];

const alan = "w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

interface KursFormProps {
  kurs?: {
    id: string;
    baslik: string;
    baslikEn: string | null;
    baslikAz: string | null;
    aciklama: string;
    aciklamaEn: string | null;
    aciklamaAz: string | null;
    seviye: string;
    seviyeEn: string | null;
    seviyeAz: string | null;
    kapakUrl: string | null;
    tanitimVideoUrl: string | null;
  };
}

export default function KursForm({ kurs }: KursFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [baslik, setBaslik] = useState(kurs?.baslik ?? "");
  const [baslikEn, setBaslikEn] = useState(kurs?.baslikEn ?? "");
  const [baslikAz, setBaslikAz] = useState(kurs?.baslikAz ?? "");
  const [aciklama, setAciklama] = useState(kurs?.aciklama ?? "");
  const [aciklamaEn, setAciklamaEn] = useState(kurs?.aciklamaEn ?? "");
  const [aciklamaAz, setAciklamaAz] = useState(kurs?.aciklamaAz ?? "");
  const [seviye, setSeviye] = useState(kurs?.seviye ?? SEVIYELER[0]);
  const [seviyeEn, setSeviyeEn] = useState(kurs?.seviyeEn ?? "");
  const [seviyeAz, setSeviyeAz] = useState(kurs?.seviyeAz ?? "");
  const [kapakUrl, setKapakUrl] = useState(kurs?.kapakUrl ?? "");
  const [tanitimVideoUrl, setTanitimVideoUrl] = useState(kurs?.tanitimVideoUrl ?? "");
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
      seviye,
      seviyeEn,
      seviyeAz,
      kapakUrl,
      tanitimVideoUrl,
    };
    const url = kurs ? `/api/admin/courses/${kurs.id}` : "/api/admin/courses";
    const method = kurs ? "PATCH" : "POST";

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
      toast.success(kurs ? "Kurs güncellendi." : "Kurs oluşturuldu.");
      router.push(kurs ? `/admin/courses/${kurs.id}/edit` : `/admin/courses/${veri.kurs.id}/edit`);
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
        <label className={etiket}>Seviye</label>
        <select value={seviye} onChange={(e) => setSeviye(e.target.value)} className={alan + " w-full sm:w-64"}>
          {SEVIYELER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          {kurs && !SEVIYELER.includes(kurs.seviye) && <option value={kurs.seviye}>{kurs.seviye}</option>}
        </select>
        <p className="text-xs text-metin/45 mt-1.5">
          Bu değer, Kurslar sayfasındaki &quot;Seviyeler&quot; filtresinin grup anahtarı — dilden bağımsız sabit
          kalır. Aşağıdakiler yalnızca EN/AZ sitede gösterilecek etiket metni.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label className={etiket}>Seviye adı (İngilizce, opsiyonel)</label>
            <input value={seviyeEn} onChange={(e) => setSeviyeEn(e.target.value)} placeholder={seviye} className={alan} />
          </div>
          <div>
            <label className={etiket}>Seviye adı (Azerbaycan dili, opsiyonel)</label>
            <input value={seviyeAz} onChange={(e) => setSeviyeAz(e.target.value)} placeholder={seviye} className={alan} />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <label className={etiket}>Kapak görseli (opsiyonel)</label>
          <GorselInput value={kapakUrl} onChange={setKapakUrl} oran={4 / 3} />
        </div>
        <div>
          <label className={etiket}>Tanıtım videosu (opsiyonel)</label>
          <VideoInput value={tanitimVideoUrl} onChange={setTanitimVideoUrl} />
          {tanitimVideoUrl.startsWith("/uploads/") && (
            <VideoKareSecici videoUrl={tanitimVideoUrl} onSecildi={setKapakUrl} oran={4 / 3} />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : kurs ? "Kaydet" : "Kursu oluştur"}
        </button>
      </div>
    </form>
  );
}
