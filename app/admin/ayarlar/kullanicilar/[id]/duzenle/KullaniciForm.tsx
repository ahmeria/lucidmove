"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

interface Kullanici {
  id: string;
  ad: string;
  email: string;
  telefon: string | null;
  role: string;
  sistemYoneticisiMi: boolean;
}

export default function KullaniciForm({ kullanici, kendisiMi }: { kullanici: Kullanici; kendisiMi: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [ad, setAd] = useState(kullanici.ad);
  const [email, setEmail] = useState(kullanici.email);
  const [telefon, setTelefon] = useState(kullanici.telefon ?? "");
  const [role, setRole] = useState(kullanici.role);
  const [sistemYoneticisiMi, setSistemYoneticisiMi] = useState(kullanici.sistemYoneticisiMi);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch(`/api/admin/kullanicilar/${kullanici.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, email, telefon, role, sistemYoneticisiMi }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Kullanıcı güncellendi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Ad Soyad</label>
          <input
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            required
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Telefon</label>
          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={kendisiMi}
            title={kendisiMi ? "Kendi rolünüzü değiştiremezsiniz" : undefined}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none disabled:opacity-50"
          >
            <option value="UYE">Üye</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {role === "ADMIN" && (
        <label className="flex items-center gap-2 text-sm text-metin/70">
          <input
            type="checkbox"
            checked={sistemYoneticisiMi}
            onChange={(e) => setSistemYoneticisiMi(e.target.checked)}
            disabled={kendisiMi && sistemYoneticisiMi}
            title={kendisiMi && sistemYoneticisiMi ? "Kendi sistem yöneticiliğinizi kaldıramazsınız" : undefined}
          />
          Sistem yöneticisi — Ayarlar bölümüne (Kullanıcılar, Roller, Cache, Yedekleme, Sistem Logları) erişebilir
        </label>
      )}

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
