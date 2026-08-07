"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGruplariniAl } from "./admin-nav-data";

export default function AdminNav() {
  const pathname = usePathname();
  const gruplar = adminNavGruplariniAl();

  return (
    <nav className="flex flex-col gap-5">
      {gruplar.map((grup, i) => (
        <div key={grup.baslik ?? `grup-${i}`}>
          {grup.baslik && (
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-metin/40 px-3 mb-1.5">
              {grup.baslik}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {grup.ogeler.map((oge) => {
              const aktif = oge.exact ? pathname === oge.href : pathname.startsWith(oge.href);
              const Ikon = oge.ikon;
              return (
                <Link
                  key={oge.href}
                  href={oge.href}
                  className={`flex items-center gap-2.5 font-body text-sm rounded-xl px-3 py-2 transition-colors ${
                    aktif ? "bg-vurgu text-white font-medium" : "text-metin/70 hover:text-metin hover:bg-cizgi/50"
                  }`}
                >
                  <Ikon className="size-4 shrink-0" />
                  {oge.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
