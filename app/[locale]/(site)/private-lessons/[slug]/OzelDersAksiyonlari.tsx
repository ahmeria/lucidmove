"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";

// KampAksiyonlari'nın auth-gate + Iyzico-embed deseni, ama yalnızca 3 durum
// (rezervasyon/geri sayım yok — kapasite/tarih kısıtı olmayan dijital içerik
// için gerekmiyor): anonim, satın alınmamış, satın alınmış.
export default function OzelDersAksiyonlari({
  slug,
  ilkVideoSlug,
  satinAlindiMi,
  baslangicDurum,
}: {
  slug: string;
  ilkVideoSlug: string | null;
  satinAlindiMi: boolean;
  baslangicDurum?: string;
}) {
  const t = useTranslations("privateLessons");
  const { data: session } = useSession();
  const router = useRouter();
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [checkoutFormHtml, setCheckoutFormHtml] = useState<string | null>(null);
  const [hata, setHata] = useState("");

  async function satinAl() {
    setHata("");
    if (!session) {
      router.push(`/register?returnTo=${encodeURIComponent(`/private-lessons/${slug}`)}`);
      return;
    }
    setGonderiliyor(true);
    try {
      const res = await fetch(`/api/private-lessons/${slug}/purchase`, { method: "POST" });
      const veri = await res.json();
      if (!res.ok) {
        setHata(veri.hata || t("odemeBaslatilamadi"));
        return;
      }
      if (veri.paymentPageUrl) window.location.href = veri.paymentPageUrl;
      else if (veri.checkoutFormContent) setCheckoutFormHtml(veri.checkoutFormContent);
    } catch {
      setHata(t("baglantiHatasi"));
    } finally {
      setGonderiliyor(false);
    }
  }

  if (checkoutFormHtml) {
    return (
      <div className="mt-8 max-w-xl">
        <p className="font-body text-sm text-metin/60 mb-4">{t("iyzicoFormu")}</p>
        <div dangerouslySetInnerHTML={{ __html: checkoutFormHtml }} />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {baslangicDurum === "basarili" && (
        <p className="font-body text-sm bg-vurgu/15 text-vurgu-dark rounded-2xl py-3 px-4">{t("odemeBasarili")}</p>
      )}
      {baslangicDurum === "basarisiz" && (
        <p className="font-body text-sm bg-red-50 text-red-700 rounded-2xl py-3 px-4">{t("odemeBasarisiz")}</p>
      )}
      {hata && <p className="font-body text-sm bg-red-50 text-red-700 rounded-2xl py-3 px-4">{hata}</p>}

      {satinAlindiMi ? (
        <Link
          href={ilkVideoSlug ? `/private-lessons/${slug}/${ilkVideoSlug}` : `/private-lessons/${slug}`}
          className="inline-block bg-toprak text-white px-7 py-3.5 rounded-full font-body text-sm hover:bg-toprak-dark transition-colors"
        >
          {t("izlemeyeBasla")}
        </Link>
      ) : (
        <button
          type="button"
          onClick={satinAl}
          disabled={gonderiliyor}
          className="bg-toprak text-white px-7 py-3.5 rounded-full font-body text-sm hover:bg-toprak-dark transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "…" : t("satinAl")}
        </button>
      )}
    </div>
  );
}
