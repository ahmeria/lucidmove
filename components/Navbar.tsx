"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import DilSecici from "./DilSecici";

function KapatIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M5 5l14 14M19 5 5 19" strokeLinecap="round" />
    </svg>
  );
}

function HesapIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" strokeLinecap="round" />
    </svg>
  );
}

function baslangicHarfleri(isim: string) {
  return isim
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [fotoHata, setFotoHata] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const anaSayfaMi = pathname === "/";
  const girisKayitMi = pathname === "/login" || pathname === "/register";
  const adminMi = session?.user?.role === "ADMIN";
  const hesabimHref = adminMi ? "/admin" : "/account";
  const hesabimEtiketi = adminMi ? t("panel") : t("hesabim");

  // Tam ekran mobil menü açıkken arkadaki sayfanın kaymasını engelle.
  useEffect(() => {
    if (!open) return;
    const onceki = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = onceki;
    };
  }, [open]);

  // Giriş/Kayıt artık tam ekran, kart-üzerinde-fotoğraf tasarımıyla kendi
  // logosunu (karta bağlı) taşıyor — ayrı bir header şeridine gerek yok,
  // deneyim tamamen immersive/tek-viewport (bkz. app/[locale]/(site)/login/page.tsx).
  if (girisKayitMi) return null;

  // Ana sayfada üstteki geniş görselin üzerine binen, minimal/şeffaf bir
  // üst bar kullanıyoruz — diğer tüm sayfalarda tam menülü klasik navbar.
  // (admin@lucidmove.net'in Türkçe URL'i yok — bkz. i18n/routing.ts)
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

          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href={hesabimHref}
                className="text-sm font-body text-white/90 hover:text-white border border-white/40 hover:border-white/70 rounded-full px-4 py-1.5 transition-colors"
              >
                {hesabimEtiketi}
              </Link>
            ) : (
              <>
                {/* Küçük ekranda tam cümle sığmadığı/dikkat dağıttığı için
                    yalnızca kompakt bir "Giriş yap" pill'i gösteriliyor —
                    öncesinde bu blok "hidden sm:block" olduğu için mobilde
                    giriş linkine navbar'dan ULAŞILAMIYORDU. */}
                <Link
                  href="/login"
                  className="sm:hidden text-sm font-body text-white/90 hover:text-white border border-white/40 hover:border-white/70 rounded-full px-4 py-1.5 transition-colors"
                >
                  {t("girisYap")}
                </Link>
                <p className="hidden sm:block text-sm font-body text-white/90">
                  {t("zatenUye")}{" "}
                  <Link href="/login" className="text-white underline underline-offset-4 hover:no-underline">
                    {t("girisYap")}
                  </Link>
                </p>
              </>
            )}
            <DilSecici varyant="acik" />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-zemin/90 backdrop-blur border-b border-cizgi">
        <nav className="container-nefes flex items-center justify-between h-20">
          <Link href="/" className="shrink-0">
            <Image src="/logo.png" alt="lucidmove" width={754} height={147} className="h-7 w-auto" priority />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {session ? (
                <>
                  <Link href={hesabimHref} className="flex items-center gap-2 text-sm font-body text-metin/70 hover:text-metin">
                    {session.user?.profilFotoUrl && !fotoHata ? (
                      <Image
                        src={session.user.profilFotoUrl}
                        alt=""
                        width={28}
                        height={28}
                        onError={() => setFotoHata(true)}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-vurgu to-vurgu-dark text-[11px] font-semibold text-white shrink-0">
                        {baslangicHarfleri(session.user?.name || "?")}
                      </span>
                    )}
                    {session.user?.name}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm font-body text-metin/70 hover:text-metin"
                  >
                    {t("cikisYap")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-body text-metin/80 hover:text-metin">
                    {t("girisYap")}
                  </Link>
                  <Link
                    href="/#membership"
                    className="text-sm font-body bg-metin text-zemin px-5 py-2.5 rounded-full hover:bg-koyu transition-colors"
                  >
                    {t("uyeOl")}
                  </Link>
                </>
              )}
            </div>

            <DilSecici />

            <button
              className="md:hidden p-2 text-metin"
              aria-label={t("menuyuAc")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Tam ekran mobil menü — <header>'ın DIŞINDA, kardeşi olarak render
          ediliyor: header'daki backdrop-blur, fixed pozisyonlu elemanlar için
          yeni bir containing block oluşturuyor, bu yüzden overlay header'ın
          İÇİNDE olsaydı "inset-0" tüm ekrana değil yalnızca header'ın kendi
          (80px'lik) kutusuna yayılırdı. */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60] bg-zemin flex flex-col">
          {/* container-nefes burada KULLANILMIYOR: bu satır dikey bir flex
              içinde çocuk olunca, sınıfın margin-left/right:auto'su (stretch
              yerine) kutuyu içeriğine göre daraltıp ortalıyor — logo/X ekranın
              ortasında sıkışık görünüyordu. Aynı 1.5rem kenar boşluğunu düz
              px-6 ile (margin olmadan) veriyoruz ki tam genişliğe yayılsın. */}
          <div className="px-6 flex items-center justify-between h-20 shrink-0 w-full">
            <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
              <Image src="/logo.png" alt="lucidmove" width={754} height={147} className="h-7 w-auto" />
            </Link>
            <button className="p-2 -mr-2 text-metin" aria-label={t("menuyuKapat")} onClick={() => setOpen(false)}>
              <KapatIkonu className="size-6" />
            </button>
          </div>

          <nav className="px-6 w-full flex-1 flex flex-col items-end justify-start gap-7 font-body text-xl overflow-y-auto pt-8 pb-10">
            <DilSecici className="mb-2" />
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className={pathname === "/courses" ? "text-toprak font-medium" : "text-metin hover:text-toprak-dark"}
            >
              {t("kurslar")}
            </Link>
            <Link href="/#membership" onClick={() => setOpen(false)} className="text-metin hover:text-toprak-dark">
              {t("uyelik")}
            </Link>
            <Link href="/#about" onClick={() => setOpen(false)} className="text-metin hover:text-toprak-dark">
              {t("hakkimda")}
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className={pathname === "/contact" ? "text-toprak font-medium" : "text-metin hover:text-toprak-dark"}
            >
              {t("iletisim")}
            </Link>

            <div className="w-20 border-t border-cizgi my-1" />

            {session ? (
              <>
                <Link
                  href={hesabimHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 text-metin hover:text-toprak-dark"
                >
                  {hesabimEtiketi}
                  <HesapIkonu className="size-5" />
                </Link>

                <div className="w-20 border-t border-cizgi my-1" />

                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-hata"
                >
                  {t("cikisYap")}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-metin hover:text-toprak-dark">
                  {t("girisYap")}
                </Link>

                <div className="w-20 border-t border-cizgi my-1" />

                <Link href="/#membership" onClick={() => setOpen(false)} className="text-toprak font-medium">
                  {t("uyeOl")}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
