"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

interface GoogleAnalyticsFormProps {
  gaMeasurementId: string | null;
  gaPropertyId: string | null;
  servisHesabiVarMi: boolean;
  servisHesabiEmail: string | null;
}

// İki ayrı şey: Measurement ID → gtag.js, ziyaretçi sayfalarına gömülüp veriyi
// TOPLAR. Property ID + servis hesabı → Data API, toplanan veriyi panele geri
// OKUR. Biri olmadan diğeri işe yaramaz (bkz. lib/analitikVerisi.ts).
export default function GoogleAnalyticsForm({
  gaMeasurementId,
  gaPropertyId,
  servisHesabiVarMi,
  servisHesabiEmail,
}: GoogleAnalyticsFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [measurementId, setMeasurementId] = useState(gaMeasurementId ?? "");
  const [propertyId, setPropertyId] = useState(gaPropertyId ?? "");
  const [servisHesabi, setServisHesabi] = useState("");
  const [hesapVarMi, setHesapVarMi] = useState(servisHesabiVarMi);
  const [hesapEmail, setHesapEmail] = useState(servisHesabiEmail);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [testEdiliyor, setTestEdiliyor] = useState(false);

  async function kaydet(servisHesabiOverride?: string) {
    setGonderiliyor(true);
    const res = await fetch("/api/admin/google-analytics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gaMeasurementId: measurementId,
        gaPropertyId: propertyId,
        servisHesabi: servisHesabiOverride ?? (servisHesabi.trim() || undefined),
      }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    setHesapVarMi(veri.analitik.servisHesabiVarMi);
    setHesapEmail(veri.analitik.servisHesabiEmail);
    setServisHesabi("");
    toast.success("Google Analytics ayarları kaydedildi.");
    router.refresh();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await kaydet();
  }

  async function baglantiyiTestEt() {
    setTestEdiliyor(true);
    try {
      const res = await fetch("/api/admin/google-analytics", { method: "POST" });
      const veri = await res.json();
      if (veri.basarili) toast.success(veri.mesaj);
      else toast.error(veri.mesaj || "Bağlantı testi başarısız oldu.");
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setTestEdiliyor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-body">
      <div>
        <h4 className="text-sm font-medium text-metin mb-1.5">Ölçüm Kodu</h4>
        <p className="text-xs text-metin/55 mb-3">
          Ziyaretçi sayfalarına gömülen gtag.js. Trafiği Google Analytics&apos;e bu alan gönderir.
        </p>
        <div className="max-w-sm">
          <label className="block text-sm text-metin/70 mb-1.5">Measurement ID</label>
          <input
            value={measurementId}
            onChange={(e) => setMeasurementId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none font-mono text-sm"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-cizgi">
        <h4 className="text-sm font-medium text-metin mb-1.5">Panel Raporları (Data API)</h4>
        <p className="text-xs text-metin/55 mb-3">
          Toplanan verinin Panel&apos;e geri okunması. Ölçüm kodundan bağımsızdır — ikisi ayrı ayrı çalışır.
        </p>

        <div className="space-y-4">
          <div className="max-w-sm">
            <label className="block text-sm text-metin/70 mb-1.5">Property ID</label>
            <input
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="493812345"
              inputMode="numeric"
              className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none font-mono text-sm"
            />
            <p className="text-xs text-metin/45 mt-1.5">
              GA4 › Yönetici › Mülk ayrıntıları ekranındaki sayısal kimlik. Measurement ID ile aynı şey değil.
            </p>
          </div>

          <div>
            <label className="block text-sm text-metin/70 mb-1.5">Servis Hesabı Anahtarı (JSON)</label>
            <textarea
              value={servisHesabi}
              onChange={(e) => setServisHesabi(e.target.value)}
              placeholder={hesapVarMi ? "{ … kayıtlı … }" : '{\n  "type": "service_account",\n  "client_email": "…",\n  "private_key": "…"\n}'}
              spellCheck={false}
              rows={5}
              className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none font-mono text-xs resize-none"
            />
            <p className="text-xs text-metin/45 mt-1.5">
              {hesapVarMi
                ? "Kayıtlı ve şifreli saklanıyor. Değiştirmek için yeni JSON dosyasının içeriğini yapıştırın."
                : "Google Cloud'dan indirdiğiniz anahtar dosyasının tamamını buraya yapıştırın."}
            </p>
          </div>

          {hesapVarMi && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="min-w-0 text-xs text-emerald-800">
                Kayıtlı servis hesabı: <span className="break-all font-medium">{hesapEmail ?? "e-posta okunamadı"}</span>
              </p>
              <button
                type="button"
                onClick={() => kaydet("-")}
                disabled={gonderiliyor}
                className="text-xs text-red-700 hover:text-red-900 disabled:opacity-50 cursor-pointer shrink-0"
              >
                Kaldır
              </button>
            </div>
          )}

          <div className="rounded-xl bg-zemin p-4 text-xs leading-relaxed text-metin/60">
            <p className="mb-1.5 font-medium text-metin/80">Kurulum adımları</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>
                <a
                  href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vurgu hover:text-vurgu-dark underline"
                >
                  Google Cloud Console
                </a>
                &apos;da <span className="font-medium">Google Analytics Data API</span>&apos;yi etkinleştirin.
              </li>
              <li>Bir servis hesabı oluşturup JSON anahtarı indirin ve içeriğini yukarıya yapıştırın.</li>
              <li>
                GA4 › Yönetici › <span className="font-medium">Mülk erişimi yönetimi</span> ekranından servis hesabının
                e-postasına <span className="font-medium">Görüntüleyici</span> yetkisi verin. Bu adım atlanırsa API
                &quot;yetkisiz&quot; döner.
              </li>
              <li>Kaydedip &quot;Bağlantıyı Test Et&quot; ile doğrulayın.</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={baglantiyiTestEt}
          disabled={testEdiliyor || !hesapVarMi}
          className="border border-cizgi text-metin px-5 py-2.5 rounded-lg text-sm hover:border-vurgu transition-colors disabled:opacity-50 cursor-pointer"
        >
          {testEdiliyor ? "Test ediliyor…" : "Bağlantıyı test et"}
        </button>
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
