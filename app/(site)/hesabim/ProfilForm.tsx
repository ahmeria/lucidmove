"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
import GorselKirpici from "@/components/GorselKirpici";

export default function ProfilForm({
  ad: baslangicAd,
  email,
  telefon: baslangicTelefon,
  profilFotoUrl: baslangicFoto,
}: {
  ad: string;
  email: string;
  telefon: string | null;
  profilFotoUrl: string | null;
}) {
  const router = useRouter();
  const [ad, setAd] = useState(baslangicAd);
  const [telefon, setTelefon] = useState(baslangicTelefon ?? "");
  const [profilFotoUrl, setProfilFotoUrl] = useState(baslangicFoto);
  const [seciliFoto, setSeciliFoto] = useState<File | null>(null);
  const [fotoYukleniyor, setFotoYukleniyor] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [kaydedildi, setKaydedildi] = useState(false);

  function fotoSecildi(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = "";
    if (!dosya) return;
    setHata("");
    setSeciliFoto(dosya);
  }

  async function fotoKirpmaTamamlandi(kirpilmisDosya: File) {
    setSeciliFoto(null);
    setFotoYukleniyor(true);
    setHata("");
    const form = new FormData();
    form.append("dosya", kirpilmisDosya);

    try {
      const res = await fetch("/api/hesabim/foto", { method: "POST", body: form });
      const veri = await res.json();
      if (!res.ok) {
        setHata(veri.hata || "Fotoğraf yüklenemedi");
        return;
      }
      setProfilFotoUrl(veri.url);
      router.refresh();
    } catch {
      setHata("Fotoğraf yüklenemedi — bağlantınızı kontrol edin");
    } finally {
      setFotoYukleniyor(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);
    setHata("");
    setKaydedildi(false);

    const res = await fetch("/api/hesabim/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, telefon }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      setHata(veri.hata || "Bir hata oluştu");
      return;
    }
    setKaydedildi(true);
    router.refresh();
  }

  return (
    <div className="space-y-6 font-body">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-cizgi shrink-0">
          {profilFotoUrl ? (
            <Image src={profilFotoUrl} alt={ad} fill sizes="64px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-metin/40 text-xl font-display">
              {ad.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <label className="inline-block cursor-pointer text-sm text-vurgu hover:text-vurgu-dark">
            {fotoYukleniyor ? "Yükleniyor…" : "Fotoğraf değiştir"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={fotoSecildi}
              disabled={fotoYukleniyor}
              className="hidden"
            />
          </label>
          <p className="text-xs text-metin/45 mt-0.5">JPG, PNG veya WEBP — en fazla 5 MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Ad Soyad</label>
          <input
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            required
            className="w-full border border-cizgi rounded-xl px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">E-posta</label>
          <input
            value={email}
            disabled
            className="w-full border border-cizgi rounded-xl px-4 py-2.5 bg-cizgi/30 text-metin/50"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Telefon</label>
          <input
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            type="tel"
            placeholder="05XX XXX XX XX"
            className="w-full border border-cizgi rounded-xl px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>

        {hata && <p className="text-sm text-hata">{hata}</p>}
        {kaydedildi && <p className="text-sm text-vurgu-dark">Kaydedildi.</p>}

        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-2.5 rounded-full text-sm hover:bg-koyu transition-colors disabled:opacity-60"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>

      {seciliFoto && (
        <GorselKirpici
          dosya={seciliFoto}
          oran={1}
          daire
          baslik="Profil fotoğrafınızı yerleştirin"
          onTamam={fotoKirpmaTamamlandi}
          onIptal={() => setSeciliFoto(null)}
        />
      )}
    </div>
  );
}
