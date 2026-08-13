"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface CommitBilgisi {
  hash: string;
  kisaHash: string;
  yazar: string;
  tarih: string;
  konu: string;
}

interface KontrolSonucu {
  dal: string;
  mevcut: CommitBilgisi;
  guncel: CommitBilgisi;
  ileri: number;
  geri: number;
  guncellemeVar: boolean;
  commitler: CommitBilgisi[];
  kirli: boolean;
  otomatikYenidenBaslatilabilir: boolean;
  uygulamaSurumu: string;
}

type GuncellemeOlayi =
  | { tur: "adim"; adim: string; etiket: string }
  | { tur: "log"; satir: string }
  | { tur: "adim-tamam"; adim: string }
  | { tur: "adim-hata"; adim: string; mesaj: string }
  | { tur: "tamam"; basarili: boolean; mesaj: string };

export default function GuncellemeManager() {
  const toast = useToast();
  const [kontrol, setKontrol] = useState<KontrolSonucu | null>(null);
  const [kontrolHata, setKontrolHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [uygulaniyor, setUygulaniyor] = useState(false);
  const [gunluk, setGunluk] = useState<string[]>([]);
  const [tamamlandi, setTamamlandi] = useState<{ basarili: boolean; mesaj: string } | null>(null);
  const [yenidenBaslatiliyor, setYenidenBaslatiliyor] = useState(false);
  const [yenidenBaslatmaHatasi, setYenidenBaslatmaHatasi] = useState("");

  async function kontrolEt() {
    setYukleniyor(true);
    setKontrolHata("");
    try {
      const res = await fetch("/api/admin/updates/check");
      const veri = await res.json();
      if (!res.ok) {
        setKontrolHata(veri.hata || "Kontrol başarısız");
        setKontrol(null);
        return;
      }
      setKontrol(veri);
    } catch {
      setKontrolHata("Bir bağlantı hatası oluştu");
    } finally {
      setYukleniyor(false);
    }
  }

  useEffect(() => {
    kontrolEt();
  }, []);

  async function guncellemeyiUygula() {
    setUygulaniyor(true);
    setGunluk([]);
    setTamamlandi(null);

    try {
      const res = await fetch("/api/admin/updates/apply", { method: "POST" });
      if (!res.body) throw new Error("Akış okunamadı");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let arabellek = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        arabellek += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = arabellek.indexOf("\n")) >= 0) {
          const satir = arabellek.slice(0, idx);
          arabellek = arabellek.slice(idx + 1);
          if (!satir.trim()) continue;
          const olay: GuncellemeOlayi = JSON.parse(satir);
          if (olay.tur === "adim") setGunluk((g) => [...g, `▸ ${olay.etiket}…`]);
          else if (olay.tur === "log") setGunluk((g) => [...g, olay.satir]);
          else if (olay.tur === "adim-tamam") setGunluk((g) => [...g, "  ✓ tamamlandı"]);
          else if (olay.tur === "adim-hata") setGunluk((g) => [...g, `  ✗ ${olay.mesaj}`]);
          else if (olay.tur === "tamam") {
            setTamamlandi({ basarili: olay.basarili, mesaj: olay.mesaj });
            if (olay.basarili) toast.success(olay.mesaj);
            else toast.error(olay.mesaj);
          }
        }
      }
      await kontrolEt();
    } catch {
      toast.error("Güncelleme sırasında bir bağlantı hatası oluştu");
    } finally {
      setUygulaniyor(false);
    }
  }

  // Restart tetiklendikten sonra sunucu bir süre (pm2'nin process'i kapatıp
  // yeniden ayağa kaldırması kadar) yanıt vermez — bu aralıkta periyodik
  // yoklama (polling) ile sunucunun geri geldiğini doğrulayıp sayfayı ancak
  // o zaman otomatik yeniliyoruz. Öncesinde kullanıcı boş bir ekranla baş
  // başa kalmasın diye açıkça "yeniden başlatılıyor" durumu gösteriliyor.
  async function sunucuGeriGelinceYenile() {
    // Sunucunun gerçekten kapanması için kısa bir pay — hemen yoklarsak eski
    // process henüz ayaktayken "başarılı" görünüp erken yenileyebiliriz.
    await new Promise((r) => setTimeout(r, 2000));

    const MAKS_DENEME = 40; // ~40 × 1.5sn ≈ 60 saniye
    for (let i = 0; i < MAKS_DENEME; i++) {
      try {
        const res = await fetch("/api/admin/updates/check", { cache: "no-store" });
        if (res.ok) {
          window.location.reload();
          return;
        }
      } catch {
        // Sunucu henüz kapalı/yeniden başlıyor — beklenen, denemeye devam.
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    setYenidenBaslatiliyor(false);
    setYenidenBaslatmaHatasi("Sunucu beklenenden uzun sürede geri gelmedi — sayfayı elle yenileyin.");
  }

  async function yenidenBaslat() {
    setYenidenBaslatmaHatasi("");
    const res = await fetch("/api/admin/updates/restart", { method: "POST" });
    const veri = await res.json();
    if (!res.ok) {
      toast.error(veri.hata || "Yeniden başlatılamadı");
      return;
    }
    toast.success(veri.mesaj || "Yeniden başlatma tetiklendi.");
    setYenidenBaslatiliyor(true);
    sunucuGeriGelinceYenile();
  }

  if (yukleniyor) {
    return <p className="font-body text-sm text-metin/60">Kontrol ediliyor…</p>;
  }

  if (kontrolHata) {
    return (
      <div>
        <p className="font-body text-sm text-hata bg-hata/10 rounded-xl px-4 py-3">{kontrolHata}</p>
        <p className="font-body text-xs text-metin/45 mt-3">
          Bu, projenin henüz bir git deposu olarak kurulmadığı ya da <code className="bg-cizgi/50 px-1 py-0.5 rounded">origin</code>{" "}
          uzak deposunun tanımlı olmadığı anlamına gelebilir.
        </p>
      </div>
    );
  }

  if (!kontrol) return null;

  return (
    <div className="space-y-6 font-body">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-cizgi rounded-xl p-4">
          <p className="text-xs text-metin/50 uppercase tracking-wide">Sürüm</p>
          <p className="text-metin font-medium mt-1">{kontrol.uygulamaSurumu}</p>
          <p className="text-xs text-metin/45 mt-1">
            Dal: <span className="font-mono">{kontrol.dal}</span> · <span className="font-mono">{kontrol.mevcut.kisaHash}</span>
          </p>
        </div>
        <div className="border border-cizgi rounded-xl p-4">
          <p className="text-xs text-metin/50 uppercase tracking-wide">Durum</p>
          <p className="text-metin font-medium mt-1">
            {kontrol.guncellemeVar ? `${kontrol.geri} yeni commit mevcut` : "Güncel"}
          </p>
          {kontrol.kirli && <p className="text-xs text-amber-700 mt-1">Sunucuda commit edilmemiş yerel değişiklik var.</p>}
        </div>
      </div>

      {kontrol.commitler.length > 0 && (
        <div>
          <p className="text-sm text-metin/70 mb-2">Gelecek değişiklikler</p>
          <ul className="space-y-1.5 max-h-48 overflow-y-auto border border-cizgi rounded-xl p-3">
            {kontrol.commitler.map((c) => (
              <li key={c.hash} className="text-xs text-metin/70 flex gap-2">
                <span className="font-mono text-metin/40 shrink-0">{c.kisaHash}</span>
                <span className="truncate">{c.konu}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {gunluk.length > 0 && (
        <pre className="bg-koyu text-zemin/90 text-xs rounded-xl p-4 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
          {gunluk.join("\n")}
        </pre>
      )}

      {tamamlandi && (
        <p className={`text-sm rounded-xl px-4 py-3 ${tamamlandi.basarili ? "bg-ikincil/10 text-ikincil" : "bg-hata/10 text-hata"}`}>
          {tamamlandi.mesaj}
        </p>
      )}

      {yenidenBaslatiliyor && (
        <p className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3 bg-amber-50 text-amber-800">
          <span className="size-3.5 shrink-0 rounded-full border-2 border-amber-800/30 border-t-amber-800 animate-spin" />
          Sunucu yeniden başlatılıyor… Geri gelince bu sayfa otomatik yenilenecek.
        </p>
      )}

      {yenidenBaslatmaHatasi && (
        <p className="text-sm rounded-xl px-4 py-3 bg-hata/10 text-hata">{yenidenBaslatmaHatasi}</p>
      )}

      <div className="flex justify-end gap-3">
        {tamamlandi?.basarili && kontrol.otomatikYenidenBaslatilabilir && (
          <button
            onClick={yenidenBaslat}
            disabled={yenidenBaslatiliyor}
            className="border border-cizgi text-metin px-5 py-2.5 rounded-lg text-sm hover:border-vurgu transition-colors disabled:opacity-60 cursor-pointer"
          >
            {yenidenBaslatiliyor ? "Yeniden başlatılıyor…" : "Yeniden başlat"}
          </button>
        )}
        <button
          onClick={guncellemeyiUygula}
          disabled={uygulaniyor || !kontrol.guncellemeVar}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {uygulaniyor ? "Güncelleniyor…" : kontrol.guncellemeVar ? "Güncelle" : "Güncel"}
        </button>
      </div>
    </div>
  );
}
