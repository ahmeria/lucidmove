"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";
import VideoKareSecici from "@/components/admin/VideoKareSecici";
import VideoInput from "./VideoInput";

const SEVIYELER = ["Başlangıç", "Orta", "İleri", "Tüm seviyeler"];

interface KursFormProps {
  kurs?: {
    id: string;
    baslik: string;
    aciklama: string;
    seviye: string;
    kapakUrl: string | null;
    tanitimVideoUrl: string | null;
    categoryId: string | null;
    sira: number;
  };
  kategoriler: { id: string; ad: string }[];
}

export default function KursForm({ kurs, kategoriler }: KursFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [baslik, setBaslik] = useState(kurs?.baslik ?? "");
  const [aciklama, setAciklama] = useState(kurs?.aciklama ?? "");
  const [seviye, setSeviye] = useState(kurs?.seviye ?? SEVIYELER[0]);
  const [kapakUrl, setKapakUrl] = useState(kurs?.kapakUrl ?? "");
  const [tanitimVideoUrl, setTanitimVideoUrl] = useState(kurs?.tanitimVideoUrl ?? "");
  const [categoryId, setCategoryId] = useState(kurs?.categoryId ?? "");
  const [sira, setSira] = useState(kurs?.sira ?? 0);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const govde = {
      baslik,
      aciklama,
      seviye,
      kapakUrl,
      tanitimVideoUrl,
      categoryId: categoryId || null,
      sira: Number(sira),
    };
    const url = kurs ? `/api/admin/kurslar/${kurs.id}` : "/api/admin/kurslar";
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
      router.push(kurs ? `/admin/kurslar/${kurs.id}/duzenle` : `/admin/kurslar/${veri.kurs.id}/duzenle`);
      router.refresh();
    } catch {
      toast.error("Bir hata oluştu");
      setGonderiliyor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Başlık</label>
        <input
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          required
          className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Açıklama</label>
        <textarea
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          required
          rows={4}
          className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none resize-none"
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Kategori</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          >
            <option value="">Kategorisiz</option>
            {kategoriler.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Seviye</label>
          <select
            value={seviye}
            onChange={(e) => setSeviye(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          >
            {SEVIYELER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {kurs && !SEVIYELER.includes(kurs.seviye) && <option value={kurs.seviye}>{kurs.seviye}</option>}
          </select>
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Sıra</label>
          <input
            type="number"
            value={sira}
            onChange={(e) => setSira(Number(e.target.value))}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Kapak görseli (opsiyonel)</label>
          <GorselInput value={kapakUrl} onChange={setKapakUrl} oran={4 / 3} />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Tanıtım videosu (opsiyonel)</label>
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
