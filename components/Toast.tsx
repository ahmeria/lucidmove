"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastTuru = "basarili" | "hata";
interface ToastKaydi {
  id: number;
  tur: ToastTuru;
  mesaj: string;
}

interface ToastBaglami {
  success: (mesaj: string) => void;
  error: (mesaj: string) => void;
}

const ToastContext = createContext<ToastBaglami | null>(null);

// Projede harici bir toast kütüphanesi yok — mevcut Tailwind + el yazımı
// bileşen konvansiyonuyla tutarlı, küçük bir context tabanlı çözüm.
export function useToast(): ToastBaglami {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider içinde kullanılmalı");
  return ctx;
}

function BasariIkonu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HataIkonu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}

function KapatIkonu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
      <path d="m5 5 14 14M19 5 5 19" strokeLinecap="round" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastlar, setToastlar] = useState<ToastKaydi[]>([]);
  const sayacRef = useRef(0);

  const kaldir = useCallback((id: number) => {
    setToastlar((t) => t.filter((x) => x.id !== id));
  }, []);

  const ekle = useCallback(
    (tur: ToastTuru, mesaj: string) => {
      const id = ++sayacRef.current;
      setToastlar((t) => [...t, { id, tur, mesaj }]);
      setTimeout(() => kaldir(id), 4000);
    },
    [kaldir]
  );

  const value: ToastBaglami = {
    success: (mesaj) => ekle("basarili", mesaj),
    error: (mesaj) => ekle("hata", mesaj),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 w-[calc(100%-2.5rem)] max-w-sm">
        {toastlar.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-riseIn flex items-start gap-3 rounded-xl border p-4 shadow-organik-hover font-body text-sm ${
              t.tur === "basarili" ? "bg-kart border-ikincil/30 text-metin" : "bg-kart border-hata/30 text-metin"
            }`}
          >
            <span className={t.tur === "basarili" ? "text-ikincil" : "text-hata"}>
              {t.tur === "basarili" ? <BasariIkonu /> : <HataIkonu />}
            </span>
            <p className="flex-1 pt-0.5">{t.mesaj}</p>
            <button
              onClick={() => kaldir(t.id)}
              aria-label="Kapat"
              className="text-metin/30 hover:text-metin/60 cursor-pointer pt-1"
            >
              <KapatIkonu />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
