import type { Metadata } from "next";
import { Bricolage_Grotesque, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { getSiteSettings } from "@/lib/settings";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: "variable",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: "variable",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const ayarlar = await getSiteSettings();
  return {
    title: ayarlar.siteBasligi,
    description: ayarlar.siteAciklamasi,
  };
}

// Navbar/Footer artık burada değil — yalnızca herkese açık site sayfaları
// app/(site)/layout.tsx üzerinden bunları alır. app/admin/** bu kök layout'un
// dışında kendi header/sidebar'ını kurar (bkz. app/admin/layout.tsx) — eskiden
// admin sayfaları hem site navbar'ını hem admin header'ını aynı anda gösteriyordu,
// bu route group ayrımı o hatayı çözüyor.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${bricolage.variable} ${archivo.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body bg-zemin text-metin">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
