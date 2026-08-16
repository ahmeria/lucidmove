"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const SEKMELER = [
  { href: "/admin/reports", label: "Kullanıcılar", exact: true },
  { href: "/admin/reports/views", label: "İzlenmeler", exact: false },
  { href: "/admin/reports/payments", label: "Ödemeler", exact: false },
];

// Ayarlar bölümündeki AyarlarSekmeleri ile aynı desen — Raporlar'ın üç alt
// sayfası arasında ince, sağa yaslı bir şeritle geçiş. Aktif "ay" filtresi
// (bkz. AyFiltresi.tsx) sekme değiştirince kaybolmasın diye linklere aynen
// taşınıyor.
export default function RaporlarSekmeleri() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ay = searchParams.get("ay");

  return (
    <div className="flex flex-nowrap gap-1.5 bg-zemin rounded-full p-1.5 max-w-full overflow-x-auto">
      {SEKMELER.map((s) => {
        const aktif = s.exact ? pathname === s.href : pathname.startsWith(s.href);
        const href = ay ? `${s.href}?ay=${ay}` : s.href;
        return (
          <Link
            key={s.href}
            href={href}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-body transition-colors ${
              aktif ? "bg-vurgu text-white font-medium" : "text-metin/60 hover:text-metin hover:bg-cizgi/50"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
