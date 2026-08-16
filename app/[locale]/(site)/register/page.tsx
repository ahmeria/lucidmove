import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import KayitFormu from "./KayitFormu";

// Bu sayfa (client bileşenli formu barındıran ince bir sunucu kabuğu — bkz.
// KayitFormu.tsx) yalnızca "generateMetadata" export edebilsin diye ayrı
// tutuldu: "use client" dosyalarından metadata export edilemez.
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "auth" });
  return { title: t("uyeOl"), robots: { index: false, follow: true } };
}

export default function Kayit() {
  return (
    <Suspense>
      <KayitFormu />
    </Suspense>
  );
}
