"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { guvenliYonlendirmeHedefi } from "@/lib/redirectGuvenligi";

function ZarfIkonu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
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

function GirisFormu() {
  const searchParams = useSearchParams();
  const sonraParam = searchParams.get("sonra");

  const [sifreGoster, setSifreGoster] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const sonuc = await signIn("credentials", { email, password, redirect: false });

    if (sonuc?.error) {
      setHata("E-posta veya şifre hatalı.");
      setYukleniyor(false);
      return;
    }

    // sonra param'ı açıkça verilmemişse role'e göre karar ver (admin -> /admin,
    // üye -> /hesabim). Session cookie'sinin taze halini garantilemek ve
    // RSC/prefetch cache'inin eski (oturumsuz) durumu göstermesini önlemek için
    // client-side router yerine tam sayfa (hard) navigasyon kullanıyoruz.
    const session = await getSession();
    const varsayilan = session?.user?.role === "ADMIN" ? "/admin" : "/hesabim";
    window.location.href = guvenliYonlendirmeHedefi(sonraParam, varsayilan);
  }

  return (
    <div className="grid lg:grid-cols-2 lg:min-h-[80vh]">
      {/* GÖRSEL PANEL — yalnızca geniş ekranda, formun soluna sabit editoryal panel */}
      <div className="relative hidden lg:block overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1200&auto=format&fit=crop"
          alt="Sakin bir ortamda yoga pratiği"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-koyu/95 via-koyu/20 to-koyu/50" />
        <div className="blob w-[340px] h-[340px] bg-vurgu/25 -top-16 -left-16" />

        <div className="relative h-full flex flex-col justify-end p-12 xl:p-16">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-white/70 mb-4">LucidMove</p>
          <p className="font-display text-3xl xl:text-4xl font-bold text-white leading-snug max-w-sm">
            Nefesinizin <em className="not-italic text-vurgu-light">hızında</em> bir pratiğe dönün.
          </p>
        </div>
      </div>

      {/* FORM PANEL */}
      <div className="flex items-center justify-center px-6 py-16 sm:py-20">
        <div className="w-full max-w-sm">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu-dark mb-4">Giriş yap</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-metin leading-tight">
            Hoş geldiniz
          </h1>
          <p className="font-body text-sm text-metin/60 mt-3">
            Derslerinize kaldığınız yerden devam etmek için giriş yapın.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5 font-body">
            <div>
              <label htmlFor="email" className="block text-sm text-metin/70 mb-1.5">
                E-posta
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
                  className="w-full border border-cizgi rounded-xl pl-11 pr-4 py-3 bg-kart text-metin focus:border-vurgu outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm text-metin/70">
                  Şifre
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-metin/35 pointer-events-none">
                  <KilitIkonu />
                </span>
                <input
                  id="password"
                  name="password"
                  type={sifreGoster ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full border border-cizgi rounded-xl pl-11 pr-11 py-3 bg-kart text-metin focus:border-vurgu outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setSifreGoster((v) => !v)}
                  aria-label={sifreGoster ? "Şifreyi gizle" : "Şifreyi göster"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-metin/40 hover:text-metin transition-colors cursor-pointer"
                >
                  <GozIkonu acik={sifreGoster} />
                </button>
              </div>
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
              {yukleniyor ? "Giriş yapılıyor…" : "Giriş yap"}
            </button>
          </form>

          <p className="font-body text-sm text-metin/60 text-center mt-8">
            Hesabınız yok mu?{" "}
            <Link href="/kayit" className="text-metin font-medium underline underline-offset-2 hover:text-vurgu-dark">
              Üye olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Giris() {
  return (
    <Suspense>
      <GirisFormu />
    </Suspense>
  );
}
