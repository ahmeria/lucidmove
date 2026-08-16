"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";
import DilSekmeli from "@/components/admin/DilSekmeli";

type Profil = {
  ad: string;
  bio: string;
  bioEn: string | null;
  bioAz: string | null;
  sertifikalar: string;
  sertifikalarEn: string | null;
  sertifikalarAz: string | null;
  yaklasim: string;
  yaklasimEn: string | null;
  yaklasimAz: string | null;
  portreUrl: string;
  hakkimdaTeaserOzet: string;
  hakkimdaTeaserOzetEn: string | null;
  hakkimdaTeaserOzetAz: string | null;
};

const alan = "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

function bos(v: string | null): string {
  return v ?? "";
}

// Ad özel isim — dilden bağımsız, tek alan kalıyor. Diğer tüm metin
// alanları (bio, sertifikalar, yaklaşım, tanıtım cümlesi) DilSekmeli ile
// TR/EN/AZ alıyor.
export default function EgitmenForm({ profil }: { profil: Profil }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    ...profil,
    bioEn: bos(profil.bioEn),
    bioAz: bos(profil.bioAz),
    sertifikalarEn: bos(profil.sertifikalarEn),
    sertifikalarAz: bos(profil.sertifikalarAz),
    yaklasimEn: bos(profil.yaklasimEn),
    yaklasimAz: bos(profil.yaklasimAz),
    hakkimdaTeaserOzetEn: bos(profil.hakkimdaTeaserOzetEn),
    hakkimdaTeaserOzetAz: bos(profil.hakkimdaTeaserOzetAz),
  });
  const [gonderiliyor, setGonderiliyor] = useState(false);

  function alanGuncelle<K extends keyof typeof form>(anahtar: K, deger: string) {
    setForm((f) => ({ ...f, [anahtar]: deger }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch("/api/admin/instructor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Eğitmen profili kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <div>
        <label className={etiket}>Ad</label>
        <input value={form.ad} onChange={(e) => alanGuncelle("ad", e.target.value)} className={alan + " max-w-sm"} />
      </div>
      <div>
        <label className={etiket}>Portre görseli — Hakkımda bölümünde gösterilir</label>
        <GorselInput value={form.portreUrl} onChange={(v) => alanGuncelle("portreUrl", v)} oran={4 / 5} />
      </div>
      <DilSekmeli
        etiket="Ana sayfa tanıtım cümlesi"
        tr={form.hakkimdaTeaserOzet}
        en={form.hakkimdaTeaserOzetEn}
        az={form.hakkimdaTeaserOzetAz}
        onTrChange={(v) => alanGuncelle("hakkimdaTeaserOzet", v)}
        onEnChange={(v) => alanGuncelle("hakkimdaTeaserOzetEn", v)}
        onAzChange={(v) => alanGuncelle("hakkimdaTeaserOzetAz", v)}
      />
      <DilSekmeli
        etiket="Biyografi (paragraflar arasında boş satır bırakın)"
        tr={form.bio}
        en={form.bioEn}
        az={form.bioAz}
        onTrChange={(v) => alanGuncelle("bio", v)}
        onEnChange={(v) => alanGuncelle("bioEn", v)}
        onAzChange={(v) => alanGuncelle("bioAz", v)}
        textarea
        rows={8}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <DilSekmeli
          etiket="Sertifikalar (satır satır)"
          tr={form.sertifikalar}
          en={form.sertifikalarEn}
          az={form.sertifikalarAz}
          onTrChange={(v) => alanGuncelle("sertifikalar", v)}
          onEnChange={(v) => alanGuncelle("sertifikalarEn", v)}
          onAzChange={(v) => alanGuncelle("sertifikalarAz", v)}
          textarea
          rows={4}
        />
        <DilSekmeli
          etiket="Yaklaşım (satır satır)"
          tr={form.yaklasim}
          en={form.yaklasimEn}
          az={form.yaklasimAz}
          onTrChange={(v) => alanGuncelle("yaklasim", v)}
          onEnChange={(v) => alanGuncelle("yaklasimEn", v)}
          onAzChange={(v) => alanGuncelle("yaklasimAz", v)}
          textarea
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
