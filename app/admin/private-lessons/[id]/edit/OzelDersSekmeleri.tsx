"use client";

import { useState } from "react";

// bkz. app/admin/courses/[id]/edit/KursSekmeleri.tsx — birebir aynı desen
// ("Özel ders bilgileri" / "Videolar (N)"), ikisi de mount'lu kalır.
export default function OzelDersSekmeleri({
  videoSayisi,
  bilgiler,
  videolar,
}: {
  videoSayisi: number;
  bilgiler: React.ReactNode;
  videolar: React.ReactNode;
}) {
  const [aktif, setAktif] = useState<"bilgiler" | "videolar">(videoSayisi === 0 ? "videolar" : "bilgiler");

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
          Özel ders bilgileri
        </button>
        <button
          type="button"
          onClick={() => setAktif("videolar")}
          className={`rounded-full px-4 py-2 text-sm font-body transition-colors cursor-pointer ${
            aktif === "videolar" ? "bg-vurgu text-white font-medium" : "text-metin/60 hover:text-metin hover:bg-cizgi/50"
          }`}
        >
          Videolar ({videoSayisi})
        </button>
      </div>

      <div className={aktif === "bilgiler" ? "" : "hidden"}>{bilgiler}</div>
      <div className={aktif === "videolar" ? "" : "hidden"}>{videolar}</div>
    </div>
  );
}
