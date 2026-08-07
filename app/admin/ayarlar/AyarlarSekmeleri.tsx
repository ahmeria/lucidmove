"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AYARLAR_OGELERI } from "../admin-nav-data";

// Ayarlar artık sidebar'da değil, yalnızca usermenu'de (bkz. AdminHeader) —
// bu şerit, usermenu'yü her seferinde açmadan Kullanıcılar/Roller/Cache vb.
// arasında gezinmek için her /admin/ayarlar/** sayfasının üstünde gösterilir.
export default function AyarlarSekmeleri() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1.5 mb-8 bg-kart border border-cizgi rounded-full p-1.5 shadow-organik w-fit max-w-full overflow-x-auto">
      {AYARLAR_OGELERI.map((oge) => {
        const aktif = oge.exact ? pathname === oge.href : pathname.startsWith(oge.href);
        const Ikon = oge.ikon;
        return (
          <Link
            key={oge.href}
            href={oge.href}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-body transition-colors ${
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
