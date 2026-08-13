"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HesabimClient() {
  const router = useRouter();
  const [onaySoruluyor, setOnaySoruluyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function iptalEt() {
    setYukleniyor(true);
    setHata("");
    try {
      const res = await fetch("/api/membership/cancel", { method: "POST" });
      if (!res.ok) {
        const veri = await res.json();
        setHata(veri.hata || "Bir hata oluştu.");
        return;
      }
      router.refresh();
    } catch {
      setHata("Bir bağlantı hatası oluştu.");
    } finally {
      setYukleniyor(false);
      setOnaySoruluyor(false);
    }
  }

  if (onaySoruluyor) {
    return (
      <div className="pt-4 mt-2 border-t border-cizgi">
        <p className="text-metin/70">Üyeliğinizi iptal etmek istediğinize emin misiniz?</p>
        <div className="flex gap-3 mt-3">
          <button
            onClick={iptalEt}
            disabled={yukleniyor}
            className="text-red-700 border border-red-200 px-4 py-2 rounded-full text-sm hover:bg-red-50 disabled:opacity-60"
          >
            {yukleniyor ? "İptal ediliyor…" : "Evet, iptal et"}
          </button>
          <button
            onClick={() => setOnaySoruluyor(false)}
            className="text-metin/60 px-4 py-2 rounded-full text-sm hover:text-metin"
          >
            Vazgeç
          </button>
        </div>
        {hata && <p className="text-red-700 text-sm mt-2">{hata}</p>}
      </div>
    );
  }

  return (
    <div className="pt-4 mt-2 border-t border-cizgi">
      <button
        onClick={() => setOnaySoruluyor(true)}
        className="text-metin/60 underline text-sm hover:text-metin"
      >
        Üyeliği iptal et
      </button>
    </div>
  );
}
