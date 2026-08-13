import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import { iyzicoDurumunuAl } from "@/lib/iyzicoDurumu";
import IyzicoBaglantiTest from "./IyzicoBaglantiTest";

export const dynamic = "force-dynamic";

// Salt okunur durum sayfası — gerçek API Key/Secret Key değerleri güvenlik
// nedeniyle yalnızca .env'de tutulur, hiçbir zaman istemciye tam olarak
// gönderilmez (bkz. lib/iyzicoDurumu.ts). Değiştirmek için README > "Sunucuya
// kurulum (prodüksiyon)" bölümündeki .env talimatlarına bakın.
export default async function AdminEntegrasyon() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  const durum = iyzicoDurumunuAl();

  return (
    <div>
      <SayfaBasligi sag={<AyarlarSekmeleri />} />

      <Kart baslik="Iyzico">
        <div className="space-y-6">
          <p className="font-body text-sm text-metin/60 max-w-2xl">
            Ödeme sağlayıcı kimlik bilgileri güvenlik nedeniyle yalnızca sunucudaki{" "}
            <code className="text-xs bg-cizgi/50 px-1.5 py-0.5 rounded">.env</code> dosyasında tutulur — bu sayfa
            salt okunur bir durum özeti sunar. Değiştirmek için sunucuda <code className="text-xs bg-cizgi/50 px-1.5 py-0.5 rounded">.env</code>{" "}
            dosyasını düzenleyip uygulamayı yeniden başlatmanız gerekir.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border border-cizgi rounded-xl p-4">
              <p className="text-xs text-metin/50 uppercase tracking-wide">Mod</p>
              <p className="mt-2">
                <span
                  className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    durum.mod === "canli"
                      ? "bg-ikincil/15 text-ikincil-dark"
                      : durum.mod === "sandbox"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-metin/10 text-metin/60"
                  }`}
                >
                  {durum.mod === "canli" ? "Canlı" : durum.mod === "sandbox" ? "Sandbox (test)" : "Bilinmiyor"}
                </span>
              </p>
            </div>

            <div className="border border-cizgi rounded-xl p-4">
              <p className="text-xs text-metin/50 uppercase tracking-wide">API Key</p>
              <p className="font-mono text-sm text-metin mt-2">{durum.maskelenmisApiKey ?? "— Tanımlı değil"}</p>
            </div>

            <div className="border border-cizgi rounded-xl p-4">
              <p className="text-xs text-metin/50 uppercase tracking-wide">Secret Key</p>
              <p className="font-mono text-sm text-metin mt-2">
                {durum.secretKeyVarMi ? "Tanımlı ✓" : "Tanımlı değil"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-metin/50 uppercase tracking-wide mb-2">Base URL</p>
            <p className="font-mono text-xs text-metin/70 bg-zemin rounded-lg px-3 py-2 inline-block break-all">
              {durum.baseUrl}
            </p>
          </div>

          {!durum.yapilandirilmisMi && (
            <p className="font-body text-sm text-hata bg-hata/10 rounded-xl px-4 py-3">
              API Key ve/veya Secret Key tanımlı değil — ödeme akışı çalışmaz.
            </p>
          )}

          <div className="border-t border-cizgi pt-6 space-y-5">
            <div>
              <p className="font-body text-sm font-medium text-metin">Callback URL</p>
              <p className="font-body text-xs text-metin/50 mt-1 max-w-2xl">
                Iyzico panelinde elle girmenize gerek yok — bu adres her ödeme başlatıldığında otomatik
                gönderiliyor (bkz. <code className="text-xs bg-cizgi/50 px-1.5 py-0.5 rounded">NEXTAUTH_URL</code>).
                Iyzico&apos;nun kendi dokümantasyonuna göre bu adresin <strong>geçerli bir SSL sertifikasına
                sahip (https)</strong> olması zorunlu — aksi halde ödeme sonucu siteye hiç dönmez.
              </p>
              <p className="font-mono text-xs text-metin/70 bg-zemin rounded-lg px-3 py-2 inline-block break-all mt-2">
                {durum.callbackUrl}
              </p>
              {!durum.nextAuthUrlGecerliMi && (
                <p className="font-body text-sm text-hata bg-hata/10 rounded-xl px-4 py-3 mt-2 max-w-2xl">
                  NEXTAUTH_URL tanımlı değil ya da geçersiz — Iyzico ödeme tamamlandığında bu adrese
                  dönemeyecek, üyelikler hiç aktifleşmeyecek. .env dosyasında https ile başlayan gerçek site
                  adresinizi tanımlayın.
                </p>
              )}
            </div>

            <div>
              <p className="font-body text-sm font-medium text-metin">Sandbox test kartları</p>
              <p className="font-body text-xs text-metin/50 mt-1 max-w-2xl">
                Sandbox modundayken gerçek kart bilgisi girmeden ödeme akışını uçtan uca denemek için
                Iyzico&apos;nun yayınladığı test kartlarını kullanabilirsiniz.
              </p>
              <a
                href="https://docs.iyzico.com/ek-bilgiler/test-kartlari"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-body text-sm text-vurgu hover:text-vurgu-dark mt-1.5"
              >
                docs.iyzico.com/ek-bilgiler/test-kartlari ↗
              </a>
            </div>
          </div>

          <div className="flex justify-end">
            <IyzicoBaglantiTest />
          </div>
        </div>
      </Kart>
    </div>
  );
}
