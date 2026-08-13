"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

export default function YeniUyeFormu() {
  const router = useRouter();
  const toast = useToast();
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [sifre, setSifre] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (sifre.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı");
      return;
    }

    setGonderiliyor(true);
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, email, telefon, sifre }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    // Bu sayfa yalnızca satın alım (abonelik) geçmişi olan üyeleri listeler —
    // yeni üyenin henüz hiç aboneliği olmadığı için listede hemen görünmez,
    // admin bunu bilmeden "kaydolmadı" sanabilir.
    toast.success("Üye oluşturuldu. Bir aboneliği olmadığı için Üyeler listesinde henüz görünmeyecek — eklemek için Üyelikler > Manuel ödeme ekle'yi kullanabilirsiniz.");
    router.push("/admin/members");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body max-w-lg">
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
          <label className="block text-sm text-metin/70 mb-1.5">Telefon (opsiyonel)</label>
          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Şifre</label>
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            required
            minLength={8}
            placeholder="En az 8 karakter"
            autoComplete="new-password"
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Oluşturuluyor…" : "Üye oluştur"}
        </button>
      </div>
    </form>
  );
}
