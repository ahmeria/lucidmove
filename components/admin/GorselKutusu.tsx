"use client";

import { useRef, useState, ChangeEvent } from "react";
import Image from "next/image";
import { dosyaYukle } from "@/lib/istemciDosyaYukleme";
import { useToast } from "@/components/Toast";

function BosResimIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path
        d="m4.5 16 4.5-4.5a1.5 1.5 0 0 1 2.1 0l2.4 2.4M13.5 13.2 15 11.7a1.5 1.5 0 0 1 2.1 0l1.9 1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Küçük, tıklanabilir kare görsel alanı — görsel yoksa boş bir yer tutucu
// ikon gösterir, varsa görseli; tıklayınca dosya seçiciyi açıp yükler. Ders
// satırlarındaki kapak görseli gibi kompakt, tek elemanlı alanlar için (bkz.
// GorselInput.tsx — o, form alanı olarak önizleme + ayrı buton düzeninde).
export default function GorselKutusu({
  value,
  onChange,
  boyutSinifi = "size-16",
}: {
  value: string;
  onChange: (v: string) => void;
  boyutSinifi?: string;
}) {
  const dosyaInputRef = useRef<HTMLInputElement>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [yuzde, setYuzde] = useState(0);
  const toast = useToast();

  async function dosyaSecildi(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    setYukleniyor(true);
    setYuzde(0);

    try {
      const veri = await dosyaYukle(dosya, setYuzde);
      onChange(veri.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      setYukleniyor(false);
      if (dosyaInputRef.current) dosyaInputRef.current.value = "";
    }
  }

  return (
    <button
      type="button"
      onClick={() => dosyaInputRef.current?.click()}
      title={value ? "Görseli değiştir" : "Görsel ekle"}
      className={`relative ${boyutSinifi} shrink-0 overflow-hidden rounded-xl border border-cizgi bg-kart hover:border-vurgu transition-colors cursor-pointer group`}
    >
      {value ? (
        <Image src={value} alt="" fill sizes="160px" className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-metin/25 group-hover:text-metin/40 transition-colors">
          <BosResimIkonu className="size-9" />
        </span>
      )}

      {yukleniyor && (
        <span className="absolute inset-0 flex items-center justify-center bg-koyu/65 text-white text-[10px] font-mono">
          %{yuzde}
        </span>
      )}

      <input
        ref={dosyaInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={dosyaSecildi}
        className="hidden"
      />
    </button>
  );
}
