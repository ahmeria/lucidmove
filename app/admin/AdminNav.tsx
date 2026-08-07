"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGruplariniAl } from "./admin-nav-data";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";

export default function AdminNav({
  sistemYoneticisiMi,
  izinliSayfalar,
}: {
  sistemYoneticisiMi: boolean;
  izinliSayfalar: string[] | null;
}) {
  const pathname = usePathname();
  // Kendisine izin verilmemiş sayfalar özel rollü hesaplarda sidebar'da hiç
  // görünmez (bkz. lib/adminYetki.ts — aynı kontrol app/admin/layout.tsx'te
  // doğrudan URL girişine karşı da uygulanıyor).
  const gruplar = adminNavGruplariniAl()
    .map((grup) => ({
      ...grup,
      ogeler: grup.ogeler.filter((oge) => sayfaErisimiVarMi({ sistemYoneticisiMi, izinliSayfalar }, oge.href)),
    }))
    .filter((grup) => grup.ogeler.length > 0);

  return (
    <nav className="flex flex-col gap-5">
      {gruplar.map((grup, i) => (
        <div key={grup.baslik ?? `grup-${i}`}>
          {grup.baslik && (
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zemin/40 px-3 mb-1.5">
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
                    aktif ? "bg-vurgu text-white font-medium" : "text-zemin/65 hover:text-zemin hover:bg-white/10"
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
