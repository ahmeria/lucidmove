"use client";

import { useState } from "react";

// Kurs düzenleme sayfasını "Kurs bilgileri" / "Dersler" olmak üzere iki sekmeye
// ayırır — ikisi de mount'lu kalır (yalnızca CSS ile gizlenir), sekme değişince
// formdaki girilmiş-ama-kaydedilmemiş veri kaybolmaz.
//
// Varsayılan sekme: dersi olmayan (yeni oluşturulmuş) bir kursta doğrudan
// "Dersler" ile açılır. Aksi halde yeni kurs oluşturup buraya yönlendirilen
// kullanıcı "Kurs bilgileri" sekmesinde kalır ve "+ Yeni ders ekle" butonunu
// hiç görmeden, o sekmeyi kendisi bulup tıklaması gerekirdi.
export default function KursSekmeleri({
  dersSayisi,
  bilgiler,
  dersler,
}: {
  dersSayisi: number;
  bilgiler: React.ReactNode;
  dersler: React.ReactNode;
}) {
  const [aktif, setAktif] = useState<"bilgiler" | "dersler">(dersSayisi === 0 ? "dersler" : "bilgiler");

  return (
    <div>
      <div className="flex gap-1.5 bg-zemin rounded-full p-1.5 w-fit mb-6">
        <button
          type="button"
          onClick={() => setAktif("bilgiler")}
          className={`rounded-full px-4 py-2 text-sm font-body transition-colors cursor-pointer ${
            aktif === "bilgiler" ? "bg-vurgu text-white font-medium" : "text-metin/60 hover:text-metin hover:bg-cizgi/50"
          }`}
        >
          Kurs bilgileri
        </button>
        <button
          type="button"
          onClick={() => setAktif("dersler")}
          className={`rounded-full px-4 py-2 text-sm font-body transition-colors cursor-pointer ${
            aktif === "dersler" ? "bg-vurgu text-white font-medium" : "text-metin/60 hover:text-metin hover:bg-cizgi/50"
          }`}
        >
          Dersler ({dersSayisi})
        </button>
      </div>

      <div className={aktif === "bilgiler" ? "" : "hidden"}>{bilgiler}</div>
      <div className={aktif === "dersler" ? "" : "hidden"}>{dersler}</div>
    </div>
  );
}
