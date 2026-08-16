"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// SiteSettings'in çeviri çözümü (cevrilenAlan) burada değil, sunucu
// tarafındaki app/[locale]/(site)/layout.tsx'te yapılıyor — bu bileşen
// yalnızca zaten seçili dile göre çözülmüş düz metinleri alıyor.
export default function Footer({
  footerTagline,
  calismaSaatleri,
  iletisimEmail,
  instagramUrl,
}: {
  footerTagline: string;
  calismaSaatleri: string;
  iletisimEmail: string;
  instagramUrl: string;
}) {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const instagramHandle = "@" + instagramUrl.replace(/\/$/, "").split("/").pop();

  // Giriş/Kayıt artık tam ekran, immersive tek-viewport bir deneyim (bkz.
  // app/[locale]/(site)/login/page.tsx) — sayfanın kendi içinde yasal
  // linkler zaten var, ayrıca footer'a gerek yok.
  const pathname = usePathname();
  const girisKayitMi = pathname === "/login" || pathname === "/register";
  if (girisKayitMi) return null;

  return (
    <footer className="bg-koyu text-zemin/80 mt-24">
      <div className="container-nefes py-14 grid gap-10 sm:grid-cols-3">
        <div>
          <Image
            src="/logo.png"
            alt="lucidmove"
            width={754}
            height={147}
            className="h-6 w-auto brightness-0 invert"
          />
          <p className="font-body text-sm mt-3 leading-relaxed text-zemin/60">{footerTagline}</p>
        </div>

        <div className="font-body text-sm">
          <p className="uppercase tracking-[0.2em] text-xs text-zemin/50 mb-3">{tFooter("site")}</p>
          <ul className="space-y-2">
            <li>
              <Link href="/courses" className="hover:text-zemin">
                {t("kurslar")}
              </Link>
            </li>
            <li>
              <Link href="/#membership" className="hover:text-zemin">
                {t("uyelik")}
              </Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-zemin">
                {t("hakkimda")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-zemin">
                {t("iletisim")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-zemin">
                {tFooter("kullanimSartlari")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-zemin">
                {tFooter("gizlilikPolitikasi")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="font-body text-sm">
          <p className="uppercase tracking-[0.2em] text-xs text-zemin/50 mb-3">{t("iletisim")}</p>
          <ul className="space-y-2 text-zemin/70">
            <li>{iletisimEmail}</li>
            <li>{calismaSaatleri}</li>
            <li>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zemin">
                {instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zemin/10 py-5">
        <p className="container-nefes font-mono text-xs text-zemin/40">
          © {new Date().getFullYear()} LucidMove. {tFooter("tumHaklari")}
        </p>
      </div>
    </footer>
  );
}
