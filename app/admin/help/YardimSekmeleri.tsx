"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { YARDIM_OGELERI } from "../admin-nav-data";

// AyarlarSekmeleri ile aynı desen — Yardım'ın izin kontrolüne bağlı olmadığı
// için (herkese açık) burada bir sistemYoneticisiMi/izinliSayfalar filtresi yok.
export default function YardimSekmeleri() {
  const pathname = usePathname();

  return (
    <div className="flex flex-nowrap gap-1.5 bg-zemin rounded-full p-1.5 max-w-full overflow-x-auto">
      {YARDIM_OGELERI.map((oge) => {
        const aktif = oge.exact ? pathname === oge.href : pathname.startsWith(oge.href);
        const Ikon = oge.ikon;
        return (
          <Link
            key={oge.href}
            href={oge.href}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-body transition-colors ${
              aktif ? "bg-vurgu text-white font-medium" : "text-metin/60 hover:text-metin hover:bg-cizgi/50"
            }`}
          >
            <Ikon className="size-3.5 shrink-0" />
            {oge.label}
          </Link>
        );
      })}
    </div>
  );
}
