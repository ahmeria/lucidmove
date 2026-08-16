"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

function IptalIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
    </svg>
  );
}

// Üyelik durumu kartının en sağındaki "üyeliği iptal et" aksiyonu — kırmızı
// bir ikon, tıklanınca satır içinde küçük bir onay adımına dönüşür. İptal,
// backend'de (bkz. app/api/membership/cancel) dönemi hemen kesmiyor; yalnızca
// bir sonraki yenilemeyi durduruyor — mevcut dönem sonuna kadar erişim devam
// ediyor (durum etiketi bunu zaten "dönem sonuna kadar erişim devam eder"
// diye açıklıyor, bkz. page.tsx > DURUM_ETIKETI).
export default function HesabimClient() {
  const t = useTranslations("account");
  const router = useRouter();
  const [onaySoruluyor, setOnaySoruluyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function iptalEt() {
    setYukleniyor(true);
    setHata("");
    try {
      const res = await fetch("/api/membership/cancel", { method: "POST" });
      if (!res.ok) {
        const veri = await res.json();
        setHata(veri.hata || t("birHataOlustu"));
        return;
      }
      router.refresh();
    } catch {
      setHata(t("baglantiHatasi"));
    } finally {
      setYukleniyor(false);
      setOnaySoruluyor(false);
    }
  }

  if (onaySoruluyor) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        {hata && <span className="font-body text-xs text-red-700 whitespace-nowrap">{hata}</span>}
        <button
          onClick={iptalEt}
          disabled={yukleniyor}
          className="font-body text-xs text-red-700 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 disabled:opacity-60 whitespace-nowrap"
        >
          {yukleniyor ? t("iptalEdiliyor") : t("evetIptalEt")}
        </button>
        <button
          onClick={() => setOnaySoruluyor(false)}
          className="font-body text-xs text-metin/60 px-3 py-1.5 rounded-full hover:text-metin whitespace-nowrap"
        >
          {t("vazgec")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOnaySoruluyor(true)}
      aria-label={t("uyelikIptalEt")}
      title={t("uyelikIptalEt")}
      className="flex items-center justify-center size-9 rounded-full text-hata hover:bg-hata/10 transition-colors shrink-0"
    >
      <IptalIkonu className="size-4" />
    </button>
  );
}
