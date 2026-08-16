"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const DIL_ETIKETI: Record<string, string> = { tr: "TR", en: "EN", az: "AZ" };

// Sağ üstteki dil seçici — aynı sayfada kalıp yalnızca locale'i değiştirir
// (next-intl'in router.replace(pathname, {locale}) deseni). "acik" (koyu
// zemin üzerinde, anasayfanın şeffaf header'ı) ve "koyu" (normal navbar,
// açık zemin) iki renk varyantı var.
export default function DilSecici({
  varyant = "koyu",
  className = "",
}: {
  varyant?: "koyu" | "acik";
  className?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {routing.locales.map((l) => {
        const aktif = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => router.replace(pathname, { locale: l })}
            aria-current={aktif}
            className={`px-2 py-1 rounded-full font-mono text-[11px] uppercase tracking-wide transition-colors cursor-pointer ${
              varyant === "acik"
                ? aktif
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white"
                : aktif
                  ? "bg-toprak/10 text-toprak-dark"
                  : "text-metin/45 hover:text-metin"
            }`}
          >
            {DIL_ETIKETI[l]}
          </button>
        );
      })}
    </div>
  );
}
