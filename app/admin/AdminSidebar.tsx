"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNav from "./AdminNav";

function MenuIkonu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

function KapatIkonu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 5l14 14M19 5 5 19" strokeLinecap="round" />
    </svg>
  );
}

// Sidebar önceden dar ekranlarda da hep açık/tam boyutta render ediliyordu —
// grid küçük ekranda tek sütuna indiğinden bu, tüm menü listesinin sayfa
// içeriğinin ÜSTÜNE dökülmesi (uzun bir kaydırma sonra asıl içeriğe
// ulaşılması) anlamına geliyordu. Artık lg altında gizli, bir hamburger
// düğmesiyle açılan tam ekran bir overlay (bkz. components/Navbar.tsx'teki
// aynı desen) — lg ve üzerinde eskisi gibi hep açık/sabit (sticky) kalıyor.
export default function AdminSidebar({
  surum,
  userEmail,
  guncellemeErisimiVar,
  sistemYoneticisiMi,
  izinliSayfalar,
}: {
  surum: string;
  userEmail: string;
  guncellemeErisimiVar: boolean;
  sistemYoneticisiMi: boolean;
  izinliSayfalar: string[] | null;
}) {
  const [acik, setAcik] = useState(false);
  const pathname = usePathname();

  // Bir sayfaya gidince overlay otomatik kapansın.
  useEffect(() => {
    setAcik(false);
  }, [pathname]);

  useEffect(() => {
    if (!acik) return;
    const onceki = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = onceki;
    };
  }, [acik]);

  return (
    <>
      {/* Yalnızca lg altında görünen ince üst şerit — logo + menü düğmesi. */}
      <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-koyu shrink-0">
        <Link href="/">
          <Image src="/logo.png" alt="lucidmove" width={754} height={147} className="h-6 w-auto brightness-0 invert" />
        </Link>
        <button
          type="button"
          onClick={() => setAcik(true)}
          aria-label="Menüyü aç"
          aria-expanded={acik}
          className="p-2 -mr-2 text-zemin/80 hover:text-zemin cursor-pointer"
        >
          <MenuIkonu />
        </button>
      </div>

      {acik && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setAcik(false)} aria-hidden="true" />
      )}

      <aside
        className={`bg-koyu p-6 flex flex-col fixed inset-y-0 left-0 z-50 w-[248px] overflow-y-auto transition-transform duration-200 ease-out
          ${acik ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto`}
      >
        <div className="flex items-center justify-between lg:block">
          <Link href="/">
            <Image src="/logo.png" alt="lucidmove" width={754} height={147} className="h-6 w-auto brightness-0 invert" />
          </Link>
          <button
            type="button"
            onClick={() => setAcik(false)}
            aria-label="Menüyü kapat"
            className="lg:hidden p-1 -mr-1 text-zemin/70 hover:text-zemin cursor-pointer"
          >
            <KapatIkonu />
          </button>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zemin/45 mt-1 mb-8">Yönetim</p>

        <AdminNav sistemYoneticisiMi={sistemYoneticisiMi} izinliSayfalar={izinliSayfalar} />

        <div className="mt-auto pt-6 border-t border-zemin/10 space-y-1.5">
          <p className="font-body text-xs text-zemin/50 truncate">{userEmail}</p>
          {guncellemeErisimiVar ? (
            <Link
              href="/admin/settings/updates"
              title="Güncellemeleri kontrol et"
              className="font-mono text-[11px] text-zemin/35 hover:text-zemin/60 transition-colors"
            >
              {surum}
            </Link>
          ) : (
            <p className="font-mono text-[11px] text-zemin/35">{surum}</p>
          )}
        </div>
      </aside>
    </>
  );
}
