"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PricingCard from "@/components/PricingCard";

export interface FiyatPlani {
  plan: string;
  baslik: string;
  fiyat: string;
  periyot: string;
  aciklama: string;
  ozellikler: string[];
  rozet: string | null;
  vurgulu: boolean;
}

export default function FiyatPlanlari({
  planlar,
  sonraUrl = "/#uyelik",
}: {
  planlar: FiyatPlani[];
  sonraUrl?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [yuklenenPlan, setYuklenenPlan] = useState<string | null>(null);
  const [checkoutFormHtml, setCheckoutFormHtml] = useState<string | null>(null);
  const [hata, setHata] = useState("");

  async function planSec(plan: string) {
    setHata("");

    if (!session) {
      router.push(`/kayit?sonra=${encodeURIComponent(sonraUrl)}`);
      return;
    }

    setYuklenenPlan(plan);
    try {
      const res = await fetch("/api/uyelik/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const veri = await res.json();

      if (!res.ok) {
        setHata(veri.hata || "Ödeme başlatılamadı, lütfen tekrar deneyin.");
        return;
      }

      if (veri.paymentPageUrl) {
        window.location.href = veri.paymentPageUrl;
      } else if (veri.checkoutFormContent) {
        setCheckoutFormHtml(veri.checkoutFormContent);
      }
    } catch {
      setHata("Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setYuklenenPlan(null);
    }
  }

  if (checkoutFormHtml) {
    return (
      <div className="max-w-xl mx-auto">
        <p className="font-body text-sm text-metin/60 mb-4 text-center">
          Ödemenizi güvenli Iyzico formu üzerinden tamamlayın.
        </p>
        <div dangerouslySetInnerHTML={{ __html: checkoutFormHtml }} />
      </div>
    );
  }

  return (
    <div>
      {hata && (
        <p className="text-center font-body text-sm bg-red-50 text-red-700 rounded-2xl py-3 px-4 mb-10 max-w-md mx-auto">
          {hata}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {planlar.map((p) => (
          <PricingCard
            key={p.plan}
            baslik={p.baslik}
            fiyat={p.fiyat}
            periyot={p.periyot}
            aciklama={p.aciklama}
            rozet={p.rozet}
            vurgu={p.vurgulu}
            ozellikler={p.ozellikler}
            onSec={() => planSec(p.plan)}
            yukleniyor={yuklenenPlan === p.plan}
          />
        ))}
      </div>
    </div>
  );
}
