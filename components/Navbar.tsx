"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/#kurslar", label: "Kurslar" },
  { href: "/#uyelik", label: "Üyelik" },
  { href: "/#hakkimda", label: "Hakkımda" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const anaSayfaMi = pathname === "/";
  const adminMi = session?.user?.role === "ADMIN";
  const hesabimHref = adminMi ? "/admin" : "/hesabim";
  const hesabimEtiketi = adminMi ? "Panel" : "Hesabım";

  // Ana sayfada üstteki geniş görselin üzerine binen, minimal/şeffaf bir
  // üst bar kullanıyoruz — diğer tüm sayfalarda tam menülü klasik navbar.
  if (anaSayfaMi) {
    return (
      <header className="absolute top-0 left-0 right-0 z-20">
        <nav className="container-nefes flex items-center justify-between h-20 sm:h-24">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="lucidmove"
              width={754}
              height={147}
              className="h-6 sm:h-7 w-auto brightness-0 invert"
              priority
            />
          </Link>

          {session ? (
            <Link href={hesabimHref} className="text-sm font-body text-white/90 hover:text-white">
              {hesabimEtiketi}
            </Link>
          ) : (
            <p className="text-sm font-body text-white/90">
              Zaten üye misiniz?{" "}
              <Link href="/giris" className="text-white underline underline-offset-4 hover:no-underline">
                Giriş yap
              </Link>
            </p>
          )}
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-zemin/90 backdrop-blur border-b border-cizgi">
      <nav className="container-nefes flex items-center justify-between h-20">
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="lucidmove" width={754} height={147} className="h-7 w-auto" priority />
        </Link>

        <ul className="hidden md:flex items-center gap-8 font-body text-sm text-metin/80">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-metin transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <Link href={hesabimHref} className="flex items-center gap-2 text-sm font-body text-metin/70 hover:text-metin">
                {session.user?.profilFotoUrl && (
                  <Image
                    src={session.user.profilFotoUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                )}
                {session.user?.name}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-body text-metin/70 hover:text-metin"
              >
                Çıkış yap
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" className="text-sm font-body text-metin/80 hover:text-metin">
                Giriş yap
              </Link>
              <Link
                href="/#uyelik"
                className="text-sm font-body bg-metin text-zemin px-5 py-2.5 rounded-full hover:bg-koyu transition-colors"
              >
                Üye ol
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-metin"
          aria-label="Menüyü aç"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-cizgi bg-zemin">
          <ul className="container-nefes flex flex-col py-4 gap-4 font-body text-metin/85">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-cizgi">
              {session ? (
                <div className="flex flex-col gap-3">
                  <Link href={hesabimHref} onClick={() => setOpen(false)}>
                    {hesabimEtiketi}
                  </Link>
                  <button className="text-left" onClick={() => signOut({ callbackUrl: "/" })}>
                    Çıkış yap
                  </button>
                </div>
              ) : (
                <Link href="/giris" onClick={() => setOpen(false)}>
                  Giriş yap
                </Link>
              )}
            </li>
            {!session && (
              <li>
                <Link
                  href="/#uyelik"
                  onClick={() => setOpen(false)}
                  className="inline-block bg-metin text-zemin px-5 py-2.5 rounded-full"
                >
                  Üye ol
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
