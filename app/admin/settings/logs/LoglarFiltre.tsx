"use client";

import { useRouter, useSearchParams } from "next/navigation";

const KATEGORILER = [
  { deger: "", etiket: "Tüm kategoriler" },
  { deger: "auth", etiket: "Giriş" },
  { deger: "kategori", etiket: "Kategori" },
  { deger: "kurs", etiket: "Kurs" },
  { deger: "ders", etiket: "Ders" },
  { deger: "kullanici", etiket: "Kullanıcı" },
  { deger: "uyelik", etiket: "Üyelik" },
  { deger: "cache", etiket: "Cache" },
  { deger: "yedekleme", etiket: "Yedekleme" },
];

const SEVIYELER = [
  { deger: "", etiket: "Tüm seviyeler" },
  { deger: "INFO", etiket: "Bilgi" },
  { deger: "ERROR", etiket: "Hata" },
];

export default function LoglarFiltre() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function guncelle(anahtar: string, deger: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (deger) params.set(anahtar, deger);
    else params.delete(anahtar);
    params.delete("sayfa");
    router.push(`/admin/settings/logs?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={searchParams.get("kategori") ?? ""}
        onChange={(e) => guncelle("kategori", e.target.value)}
        className="border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
      >
        {KATEGORILER.map((k) => (
          <option key={k.deger} value={k.deger}>
            {k.etiket}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("seviye") ?? ""}
        onChange={(e) => guncelle("seviye", e.target.value)}
        className="border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
      >
        {SEVIYELER.map((s) => (
          <option key={s.deger} value={s.deger}>
            {s.etiket}
          </option>
        ))}
      </select>
    </div>
  );
}
