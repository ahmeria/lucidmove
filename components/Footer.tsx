"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@prisma/client";

export default function Footer({ ayarlar }: { ayarlar: SiteSettings }) {
  const instagramHandle = "@" + ayarlar.instagramUrl.replace(/\/$/, "").split("/").pop();

  // Giriş/Kayıt artık tam ekran, immersive tek-viewport bir deneyim (bkz.
  // app/(site)/login/page.tsx) — sayfanın kendi içinde yasal linkler zaten
  // var, ayrıca footer'a gerek yok.
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
          <p className="font-body text-sm mt-3 leading-relaxed text-zemin/60">{ayarlar.footerTagline}</p>
        </div>

        <div className="font-body text-sm">
          <p className="uppercase tracking-[0.2em] text-xs text-zemin/50 mb-3">Site</p>
          <ul className="space-y-2">
            <li><Link href="/#courses" className="hover:text-zemin">Kurslar</Link></li>
            <li><Link href="/#membership" className="hover:text-zemin">Üyelik</Link></li>
            <li><Link href="/#about" className="hover:text-zemin">Hakkımda</Link></li>
            <li><Link href="/contact" className="hover:text-zemin">İletişim</Link></li>
            <li><Link href="/terms" className="hover:text-zemin">Kullanım Şartları</Link></li>
            <li><Link href="/privacy" className="hover:text-zemin">Gizlilik Politikası</Link></li>
          </ul>
        </div>

        <div className="font-body text-sm">
          <p className="uppercase tracking-[0.2em] text-xs text-zemin/50 mb-3">İletişim</p>
          <ul className="space-y-2 text-zemin/70">
            <li>{ayarlar.iletisimEmail}</li>
            <li>{ayarlar.calismaSaatleri}</li>
            <li>
              <Link href={ayarlar.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zemin">
                {instagramHandle}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zemin/10 py-5">
        <p className="container-nefes font-mono text-xs text-zemin/40">
          © {new Date().getFullYear()} LucidMove. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
