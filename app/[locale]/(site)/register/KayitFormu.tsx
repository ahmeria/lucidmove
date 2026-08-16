"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { signIn } from "next-auth/react";
import { Link, useRouter, getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { guvenliYonlendirmeHedefi } from "@/lib/redirectGuvenligi";

function KullaniciIkonu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.5 4.4-5.5 7.5-5.5s6.1 2 7.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

function ZarfIkonu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TelefonIkonu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M5.5 4.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3c0 1-.9 1.8-1.9 1.6-6-1-10.7-5.7-11.7-11.7C4.7 6.4 4.5 5.5 5.5 4.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KilitIkonu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function GozIkonu({ acik }: { acik: boolean }) {
  return acik ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M3.5 3.5l17 17M10.6 10.7a3 3 0 0 0 4.2 4.2M7.4 7.6C4.9 9.1 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.7 0 3.2-.5 4.5-1.2M12 5.5c6 0 9.5 6.5 9.5 6.5a15 15 0 0 1-2.3 3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KayitFormu() {
  const t = useTranslations("auth");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const searchParams = useSearchParams();
  const sonra = guvenliYonlendirmeHedefi(
    searchParams.get("returnTo"),
    getPathname({ href: "/#membership", locale })
  );
  // Not: kayıt her zaman UYE rolü oluşturur, admin ihtimali yok — bu yüzden
  // giriş sayfasındaki gibi role bazlı dallanmaya gerek yok.

  const [sifreGoster, setSifreGoster] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);

    const form = e.currentTarget;
    const ad = (form.elements.namedItem("ad") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const telefon = (form.elements.namedItem("telefon") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad, email, telefon, password }),
      });
      const veri = await res.json();

      if (!res.ok) {
        const kodMesajlari: Record<string, string> = {
          COK_FAZLA_DENEME: t("cokFazlaDeneme"),
          EPOSTA_KAYITLI: t("epostaKayitli"),
          GECERSIZ_VERI: t("kayitHatasi"),
        };
        setHata(kodMesajlari[veri.kod] || t("kayitHatasi"));
        setYukleniyor(false);
        return;
      }

      const girisSonucu = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (girisSonucu?.error) {
        router.push("/login");
        return;
      }

      // Taze session cookie'siyle tam sayfa navigasyon — bkz. app/[locale]/(site)/login/GirisFormu.tsx.
      window.location.href = sonra;
    } catch {
      setHata(t("baglantiHatasi"));
      setYukleniyor(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-16">
      {/* Tam ekran editoryal fotoğraf + koyu degrade — immersive, tek-viewport kayıt deneyimi */}
      <Image
        src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1920&auto=format&fit=crop"
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-koyu/85 via-koyu/55 to-koyu/90" />
      <div className="blob w-[420px] h-[420px] bg-ikincil/25 -top-24 -right-20 animate-breathe" />
      <div className="blob w-[360px] h-[360px] bg-vurgu/20 -bottom-28 -left-16" />

      <div className="relative w-full max-w-md animate-riseIn">
        <Link href="/" className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="lucidmove"
            width={754}
            height={147}
            className="h-7 w-auto brightness-0 invert"
            priority
          />
        </Link>

        <div className="bg-kart rounded-[2rem] shadow-organik-hover p-8 sm:p-10">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu-dark mb-3">{t("uyeOl")}</p>
          <h1 className="font-display text-3xl font-bold text-metin leading-tight">{t("kayitBasligi")}</h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 font-body">
            <div>
              <label htmlFor="ad" className="block text-sm text-metin/70 mb-1.5">
                {t("adSoyad")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-metin/35 pointer-events-none">
                  <KullaniciIkonu />
                </span>
                <input
                  id="ad"
                  name="ad"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full border border-cizgi/70 rounded-2xl pl-11 pr-4 py-3.5 bg-zemin/70 text-metin focus:border-vurgu focus:bg-kart outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-metin/70 mb-1.5">
                {t("eposta")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-metin/35 pointer-events-none">
                  <ZarfIkonu />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full border border-cizgi/70 rounded-2xl pl-11 pr-4 py-3.5 bg-zemin/70 text-metin focus:border-vurgu focus:bg-kart outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="telefon" className="block text-sm text-metin/70 mb-1.5">
                {t("telefon")} <span className="text-metin/40">{t("opsiyonel")}</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-metin/35 pointer-events-none">
                  <TelefonIkonu />
                </span>
                <input
                  id="telefon"
                  name="telefon"
                  type="tel"
                  autoComplete="tel"
                  placeholder="05XX XXX XX XX"
                  className="w-full border border-cizgi/70 rounded-2xl pl-11 pr-4 py-3.5 bg-zemin/70 text-metin focus:border-vurgu focus:bg-kart outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-metin/70 mb-1.5">
                {t("sifre")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-metin/35 pointer-events-none">
                  <KilitIkonu />
                </span>
                <input
                  id="password"
                  name="password"
                  type={sifreGoster ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full border border-cizgi/70 rounded-2xl pl-11 pr-11 py-3.5 bg-zemin/70 text-metin focus:border-vurgu focus:bg-kart outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setSifreGoster((v) => !v)}
                  aria-label={sifreGoster ? t("sifreyiGizle") : t("sifreyiGoster")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-metin/40 hover:text-metin transition-colors cursor-pointer"
                >
                  <GozIkonu acik={sifreGoster} />
                </button>
              </div>
              <p className="text-xs text-metin/50 mt-1.5">{t("enAz8Karakter")}</p>
            </div>

            {hata && (
              <p className="text-sm bg-hata/10 text-hata rounded-xl py-2.5 px-4" role="alert">
                {hata}
              </p>
            )}

            <button
              type="submit"
              disabled={yukleniyor}
              className="w-full bg-metin text-zemin py-3.5 rounded-full text-sm font-medium hover:bg-koyu transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {yukleniyor ? t("hesapOlusturuluyor") : t("hesapOlustur")}
            </button>
          </form>

          <p className="font-body text-sm text-metin/60 text-center mt-7">
            {t("zatenUyeMisiniz")}{" "}
            <Link href="/login" className="text-metin font-medium underline underline-offset-2 hover:text-vurgu-dark">
              {t("girisYapin")}
            </Link>
          </p>
        </div>

        <p className="font-body text-xs text-white/60 text-center mt-6 max-w-xs mx-auto leading-relaxed">
          {t.rich("hesapOlusturarakOnay", {
            terms: (chunks) => (
              <Link href="/terms" className="underline hover:text-white">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="underline hover:text-white">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
