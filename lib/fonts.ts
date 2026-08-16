import { Bricolage_Grotesque, Archivo, JetBrains_Mono } from "next/font/google";

// Hem site (app/[locale]/layout.tsx) hem admin (app/admin/layout.tsx) kendi
// bağımsız kök layout'u — ikisi de aynı font nesnelerini kullanmalı, next/font
// tek bir çağrı yerinden (buradan) import edilerek paylaşılıyor.
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: "variable",
});

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: "variable",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const fontDegiskenleri = `${bricolage.variable} ${archivo.variable} ${jetbrainsMono.variable}`;
