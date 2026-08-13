"use client";

import { useState, FormEvent } from "react";

type Durum = "hazir" | "gonderiliyor" | "basarili" | "hata";

export default function IletisimForm() {
  const [durum, setDurum] = useState<Durum>("hazir");
  const [hataMesaji, setHataMesaji] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDurum("gonderiliyor");
    setHataMesaji("");

    const form = e.currentTarget;
    const data = {
      ad: (form.elements.namedItem("ad") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      mesaj: (form.elements.namedItem("mesaj") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gönderim başarısız");
      setDurum("basarili");
      form.reset();
    } catch {
      setDurum("hata");
      setHataMesaji("Mesajınız gönderilemedi. Lütfen tekrar deneyin.");
    }
  }

  if (durum === "basarili") {
    return (
      <div className="border border-vurgu/40 bg-vurgu/10 rounded-2xl p-8 font-body">
        <p className="text-metin font-medium">Mesajınız iletildi.</p>
        <p className="text-metin/70 text-sm mt-2">En kısa sürede size dönüş yapacağız.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <div>
        <label htmlFor="ad" className="block text-sm text-metin/70 mb-1.5">Ad Soyad</label>
        <input
          id="ad"
          name="ad"
          type="text"
          required
          className="w-full border border-cizgi rounded-xl px-4 py-3 bg-zemin text-metin focus:border-vurgu outline-none"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-metin/70 mb-1.5">E-posta</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border border-cizgi rounded-xl px-4 py-3 bg-zemin text-metin focus:border-vurgu outline-none"
        />
      </div>
      <div>
        <label htmlFor="mesaj" className="block text-sm text-metin/70 mb-1.5">Mesajınız</label>
        <textarea
          id="mesaj"
          name="mesaj"
          required
          rows={5}
          className="w-full border border-cizgi rounded-xl px-4 py-3 bg-zemin text-metin focus:border-vurgu outline-none resize-none"
        />
      </div>

      {durum === "hata" && (
        <p className="text-sm text-red-700">{hataMesaji}</p>
      )}

      <button
        type="submit"
        disabled={durum === "gonderiliyor"}
        className="bg-metin text-zemin px-7 py-3.5 rounded-full text-sm hover:bg-koyu transition-colors disabled:opacity-60"
      >
        {durum === "gonderiliyor" ? "Gönderiliyor…" : "Mesajı gönder"}
      </button>
    </form>
  );
}
