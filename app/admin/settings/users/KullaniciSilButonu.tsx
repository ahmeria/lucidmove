"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

export default function KullaniciSilButonu({
  kullaniciId,
  kullaniciAdi,
  kendisiMi,
  tekSistemYoneticisiMi,
}: {
  kullaniciId: string;
  kullaniciAdi: string;
  kendisiMi: boolean;
  tekSistemYoneticisiMi: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [siliniyor, setSiliniyor] = useState(false);

  const engelliMi = kendisiMi || tekSistemYoneticisiMi;
  const engelNedeni = kendisiMi
    ? "Kendi hesabınızı silemezsiniz"
    : tekSistemYoneticisiMi
    ? "Tek sistem yöneticisi silinemez — önce başka bir hesabı sistem yöneticisi yapın"
    : undefined;

  async function handleSil() {
    if (!confirm(`"${kullaniciAdi}" kullanıcısını silmek istediğinize emin misiniz?`)) return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/users/${kullaniciId}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Silinemedi");
        return;
      }
      toast.success("Kullanıcı silindi.");
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  return (
    <button
      onClick={handleSil}
      disabled={siliniyor || engelliMi}
      title={engelNedeni}
      className="text-red-700 hover:text-red-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      Sil
    </button>
  );
}
