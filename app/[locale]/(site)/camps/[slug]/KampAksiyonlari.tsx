"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";

type RezervasyonDurumu = "REZERVE_EDILDI" | "ODENDI" | "SURESI_DOLDU" | "IPTAL_EDILDI";

interface SonRezervasyon {
  status: RezervasyonDurumu;
  sonOdemeTarihi: string;
}

const GUN_MS = 24 * 60 * 60 * 1000;
const SAAT_MS = 60 * 60 * 1000;

// Kampın aksiyon alanı — FiyatPlanlari.tsx'teki auth-gate + Iyzico
// checkout-embed deseninin kamp karşılığı. Altı durumu tek bileşende yönetir:
// anonim / rezervasyonsuz+yer var / rezervasyonsuz+dolu / aktif rezervasyon
// (geri sayım) / süresi dolmuş rezervasyon / ödenmiş.
export default function KampAksiyonlari({
  slug,
  kalanKontenjan,
  sonRezervasyon,
  baslangicDurum,
}: {
  slug: string;
  kalanKontenjan: number;
  sonRezervasyon: SonRezervasyon | null;
  baslangicDurum?: string;
}) {
  const t = useTranslations("camps");
  const { data: session } = useSession();
  const router = useRouter();
  const [gonderiliyor, setGonderiliyor] = useState<"SATIN_AL" | "REZERVE_ET" | "ODE" | null>(null);
  const [checkoutFormHtml, setCheckoutFormHtml] = useState<string | null>(null);
  const [hata, setHata] = useState("");
  // Geri sayımı 60 saniyede bir tazelemek için — yeni bir kütüphane
  // gerektirmeyen en basit yaklaşım (bkz. plan).
  const [, setNabiz] = useState(0);

  useEffect(() => {
    if (sonRezervasyon?.status !== "REZERVE_EDILDI") return;
    const id = setInterval(() => setNabiz((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [sonRezervasyon?.status]);

  const kalanSure = useMemo(() => {
    if (!sonRezervasyon || sonRezervasyon.status !== "REZERVE_EDILDI") return null;
    const kalanMs = new Date(sonRezervasyon.sonOdemeTarihi).getTime() - Date.now();
    if (kalanMs <= 0) return null;
    const gun = Math.floor(kalanMs / GUN_MS);
    const saat = Math.floor((kalanMs % GUN_MS) / SAAT_MS);
    return t("kalanSure", { gun, saat });
    // sonRezervasyon değişmese bile setInterval'in tetiklediği yeniden
    // render'da "Date.now()" tazelensin diye eslint-disable gerekli değil —
    // useState nabız zaten bileşeni yeniden render ediyor, useMemo bunu
    // otomatik yakalar (dependency dizisine eklemek gerekmez, ESLint burada
    // yalnızca sonRezervasyon'u ister).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sonRezervasyon]);

  async function istekGonder(url: string, gosterge: "SATIN_AL" | "REZERVE_ET" | "ODE", govde?: object) {
    setHata("");
    setGonderiliyor(gosterge);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: govde ? { "Content-Type": "application/json" } : undefined,
        body: govde ? JSON.stringify(govde) : undefined,
      });
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
      setGonderiliyor(null);
    }
  }

  function baslat(mod: "SATIN_AL" | "REZERVE_ET") {
    if (!session) {
      router.push(`/register?returnTo=${encodeURIComponent(`/camps/${slug}`)}`);
      return;
    }
    istekGonder(`/api/camps/${slug}/reserve`, mod, { mod });
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

      {sonRezervasyon?.status === "ODENDI" ? (
        <p className="font-body text-sm bg-vurgu/15 text-vurgu-dark rounded-2xl py-4 px-5">{t("odemeTamamlandi")}</p>
      ) : sonRezervasyon?.status === "REZERVE_EDILDI" && kalanSure ? (
        <div className="border border-toprak/40 bg-toprak/10 rounded-2xl p-6 space-y-3">
          <p className="font-body text-sm text-metin/80">
            {t("sonOdemeTarihi", { tarih: new Date(sonRezervasyon.sonOdemeTarihi).toLocaleString() })}
          </p>
          <p className="font-mono text-xs uppercase tracking-wide text-toprak-dark">{kalanSure}</p>
          <button
            type="button"
            onClick={() => istekGonder(`/api/camps/${slug}/pay-existing`, "ODE")}
            disabled={gonderiliyor !== null}
            className="bg-toprak text-white px-6 py-3 rounded-full font-body text-sm hover:bg-toprak-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {gonderiliyor === "ODE" ? "…" : t("odemeyiTamamla")}
          </button>
        </div>
      ) : kalanKontenjan <= 0 ? (
        <p className="font-body text-sm text-metin/60 border border-cizgi rounded-2xl py-4 px-5 inline-block">
          {t("kampDolu")}
        </p>
      ) : (
        <div className="space-y-3">
          {sonRezervasyon?.status === "SURESI_DOLDU" && (
            <p className="font-body text-sm text-metin/60">{t("rezervasyonSuresiDoldu")}</p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => baslat("SATIN_AL")}
              disabled={gonderiliyor !== null}
              className="bg-toprak text-white px-7 py-3.5 rounded-full font-body text-sm hover:bg-toprak-dark transition-colors disabled:opacity-60 cursor-pointer"
            >
              {gonderiliyor === "SATIN_AL" ? "…" : t("hemenSatinAl")}
            </button>
            <button
              type="button"
              onClick={() => baslat("REZERVE_ET")}
              disabled={gonderiliyor !== null}
              className="border border-toprak text-toprak-dark px-7 py-3.5 rounded-full font-body text-sm hover:bg-toprak/10 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {gonderiliyor === "REZERVE_ET" ? "…" : t("rezervasyonYap")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
