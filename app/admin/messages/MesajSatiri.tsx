"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import Kart from "@/components/admin/Kart";

interface Mesaj {
  id: string;
  ad: string;
  email: string;
  mesaj: string;
  okunduMu: boolean;
  createdAt: string;
}

export default function MesajSatiri({ mesaj }: { mesaj: Mesaj }) {
  const router = useRouter();
  const toast = useToast();
  const [isleniyor, setIsleniyor] = useState(false);

  async function okunduIsaretle() {
    setIsleniyor(true);
    try {
      const res = await fetch(`/api/admin/messages/${mesaj.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ okunduMu: !mesaj.okunduMu }),
      });
      if (!res.ok) {
        toast.error("İşlem başarısız");
        return;
      }
      router.refresh();
    } finally {
      setIsleniyor(false);
    }
  }

  async function sil() {
    if (!confirm(`${mesaj.ad} adlı kişinin mesajını silmek istediğinize emin misiniz?`)) return;
    setIsleniyor(true);
    try {
      const res = await fetch(`/api/admin/messages/${mesaj.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Mesaj silinemedi");
        return;
      }
      toast.success("Mesaj silindi.");
      router.refresh();
    } finally {
      setIsleniyor(false);
    }
  }

  return (
    <Kart className={mesaj.okunduMu ? "opacity-60" : ""}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body font-medium text-metin">
            {mesaj.ad} <span className="font-normal text-metin/50">— {mesaj.email}</span>
          </p>
          <p className="font-mono text-xs text-metin/40 mt-1">
            {new Date(mesaj.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button onClick={okunduIsaretle} disabled={isleniyor} className="text-vurgu hover:text-vurgu-dark disabled:opacity-50 cursor-pointer">
            {mesaj.okunduMu ? "Okunmadı işaretle" : "Okundu işaretle"}
          </button>
          <button onClick={sil} disabled={isleniyor} className="text-red-700 hover:text-red-900 disabled:opacity-50 cursor-pointer">
            Sil
          </button>
        </div>
      </div>
      <p className="font-body text-sm text-metin/75 mt-4 whitespace-pre-wrap">{mesaj.mesaj}</p>
    </Kart>
  );
}
