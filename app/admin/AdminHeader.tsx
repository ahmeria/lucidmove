"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { aktifSayfaBasligi, AYARLAR_OGELERI } from "./admin-nav-data";

function OkAsagiIkonu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4 text-metin/40">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TamEkranIkonu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-[18px]">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SiteIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" />
    </svg>
  );
}

function CikisIkonu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m16 17 5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function tamEkraniAcKapat() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

export default function AdminHeader({
  userName,
  userEmail,
  sistemYoneticisiMi,
}: {
  userName: string;
  userEmail: string;
  sistemYoneticisiMi: boolean;
}) {
  const pathname = usePathname();
  const baslik = aktifSayfaBasligi(pathname, sistemYoneticisiMi);
  const [menuAcik, setMenuAcik] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function disaTikla(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAcik(false);
    }
    document.addEventListener("mousedown", disaTikla);
    return () => document.removeEventListener("mousedown", disaTikla);
  }, []);

  return (
    <header className="sticky top-0 z-10 h-14 shrink-0 bg-kart border-b border-cizgi px-4 sm:px-6 flex items-center gap-4">
      <p className="font-display font-bold text-metin truncate">{baslik}</p>

      <div className="flex items-center gap-1 ml-auto">
        <Link
          href="/"
          title="Siteyi görüntüle"
          className="hidden sm:flex size-9 items-center justify-center rounded-lg text-metin/50 hover:bg-cizgi/50 hover:text-metin transition-colors"
        >
          <SiteIkonu className="size-[18px]" />
        </Link>
        <button
          type="button"
          onClick={tamEkraniAcKapat}
          title="Tam ekran"
          className="hidden sm:flex size-9 items-center justify-center rounded-lg text-metin/50 hover:bg-cizgi/50 hover:text-metin transition-colors cursor-pointer"
        >
          <TamEkranIkonu />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuAcik((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1 pl-2 pr-2 hover:bg-cizgi/50 transition-colors cursor-pointer"
          >
            <span className="hidden text-sm font-medium text-metin sm:block">{userName}</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-vurgu to-vurgu-dark text-xs font-semibold text-white">
              {initials(userName)}
            </span>
            <OkAsagiIkonu />
          </button>

          {menuAcik && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-cizgi bg-kart py-1.5 shadow-organik-hover max-h-[80vh] overflow-y-auto">
              <p className="px-3.5 py-2 text-xs text-metin/45 truncate border-b border-cizgi">{userEmail}</p>

              {sistemYoneticisiMi && (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-metin/35 px-3.5 pt-2.5 pb-1">
                    Ayarlar
                  </p>
                  {AYARLAR_OGELERI.map((oge) => {
                    const Ikon = oge.ikon;
                    return (
                      <Link
                        key={oge.href}
                        href={oge.href}
                        onClick={() => setMenuAcik(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                          pathname === oge.href || (!oge.exact && pathname.startsWith(oge.href))
                            ? "text-vurgu-dark font-medium bg-vurgu/10"
                            : "text-metin/70 hover:bg-cizgi/40"
                        }`}
                      >
                        <Ikon className="size-4 shrink-0" />
                        {oge.label}
                      </Link>
                    );
                  })}
                  <div className="my-1 border-t border-cizgi" />
                </>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-hata hover:bg-hata/10 cursor-pointer"
              >
                <CikisIkonu />
                Çıkış yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
