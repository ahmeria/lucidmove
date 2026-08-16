"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import GorselInput from "@/components/admin/GorselInput";
import DilSekmeli from "@/components/admin/DilSekmeli";
import VideoInput from "@/app/admin/courses/VideoInput";

type Metinler = {
  heroEyebrow: string;
  heroEyebrowEn: string | null;
  heroEyebrowAz: string | null;
  heroBaslik: string;
  heroBaslikEn: string | null;
  heroBaslikAz: string | null;
  heroAltBaslik: string;
  heroAltBaslikEn: string | null;
  heroAltBaslikAz: string | null;
  heroGorselUrl: string;
  heroVideoUrl: string | null;
  heroCtaBirincil: string;
  heroCtaBirincilEn: string | null;
  heroCtaBirincilAz: string | null;
  heroCtaIkincil: string;
  heroCtaIkincilEn: string | null;
  heroCtaIkincilAz: string | null;
  uyelikEyebrow: string;
  uyelikEyebrowEn: string | null;
  uyelikEyebrowAz: string | null;
  uyelikBaslik: string;
  uyelikBaslikEn: string | null;
  uyelikBaslikAz: string | null;
  uyelikAltBaslik: string;
  uyelikAltBaslikEn: string | null;
  uyelikAltBaslikAz: string | null;
};

const alan = "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

function bosMuYap(v: string | null): string {
  return v ?? "";
}

export default function AnaSayfaMetinleriForm({ ayarlar }: { ayarlar: Metinler }) {
  const router = useRouter();
  const toast = useToast();
  // NOT: "ayarlar" prop'u sayfa (page-design/page.tsx) üzerinden TÜM
  // SiteSettings satırını taşıyor (SiteAyarlariForm ile paylaşılıyor) —
  // burada `...ayarlar` ile TAMAMINI spread'lemek, bu formun bilmediği
  // (ör. site başlığı/İletişim'e ait) alanları da state'e/PATCH gövdesine
  // taşır ve onlar henüz null'sa "/api/admin/settings" 400 ile reddeder.
  // Bu yüzden yalnızca bu formun sahip olduğu (Metinler tipindeki) alanlar
  // tek tek seçiliyor.
  const [form, setForm] = useState({
    heroEyebrow: ayarlar.heroEyebrow,
    heroEyebrowEn: bosMuYap(ayarlar.heroEyebrowEn),
    heroEyebrowAz: bosMuYap(ayarlar.heroEyebrowAz),
    heroBaslik: ayarlar.heroBaslik,
    heroBaslikEn: bosMuYap(ayarlar.heroBaslikEn),
    heroBaslikAz: bosMuYap(ayarlar.heroBaslikAz),
    heroAltBaslik: ayarlar.heroAltBaslik,
    heroAltBaslikEn: bosMuYap(ayarlar.heroAltBaslikEn),
    heroAltBaslikAz: bosMuYap(ayarlar.heroAltBaslikAz),
    heroGorselUrl: ayarlar.heroGorselUrl,
    heroVideoUrl: bosMuYap(ayarlar.heroVideoUrl),
    heroCtaBirincil: ayarlar.heroCtaBirincil,
    heroCtaBirincilEn: bosMuYap(ayarlar.heroCtaBirincilEn),
    heroCtaBirincilAz: bosMuYap(ayarlar.heroCtaBirincilAz),
    heroCtaIkincil: ayarlar.heroCtaIkincil,
    heroCtaIkincilEn: bosMuYap(ayarlar.heroCtaIkincilEn),
    heroCtaIkincilAz: bosMuYap(ayarlar.heroCtaIkincilAz),
    uyelikEyebrow: ayarlar.uyelikEyebrow,
    uyelikEyebrowEn: bosMuYap(ayarlar.uyelikEyebrowEn),
    uyelikEyebrowAz: bosMuYap(ayarlar.uyelikEyebrowAz),
    uyelikBaslik: ayarlar.uyelikBaslik,
    uyelikBaslikEn: bosMuYap(ayarlar.uyelikBaslikEn),
    uyelikBaslikAz: bosMuYap(ayarlar.uyelikBaslikAz),
    uyelikAltBaslik: ayarlar.uyelikAltBaslik,
    uyelikAltBaslikEn: bosMuYap(ayarlar.uyelikAltBaslikEn),
    uyelikAltBaslikAz: bosMuYap(ayarlar.uyelikAltBaslikAz),
  });
  const [gonderiliyor, setGonderiliyor] = useState(false);

  function alanGuncelle<K extends keyof typeof form>(anahtar: K, deger: string) {
    setForm((f) => ({ ...f, [anahtar]: deger }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Ana sayfa metinleri kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-body">
      <div>
        <h3 className="font-body text-sm uppercase tracking-wide text-metin/50 mb-4">
          Hero — sayfa açılır açılmaz görünen üst bölüm
        </h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={etiket}>Arkaplan videosu (opsiyonel)</label>
              <VideoInput
                value={form.heroVideoUrl}
                onChange={(v) => alanGuncelle("heroVideoUrl", v)}
                sadeceYukleme
                temizlenebilir
              />
            </div>
            <div>
              <label className={etiket}>Arkaplan görseli</label>
              <GorselInput value={form.heroGorselUrl} onChange={(v) => alanGuncelle("heroGorselUrl", v)} oran={16 / 9} />
            </div>
          </div>
          <p className="text-xs text-metin/45 -mt-2">
            Video yüklenirse hero bölümünde arkaplanda video oynatılır (görsel yalnızca video yüklenene kadar geçici
            görüntü olarak kullanılır); video yoksa görsel doğrudan statik arkaplan olarak gösterilir.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <DilSekmeli
              etiket="Eyebrow (küçük üst etiket)"
              tr={form.heroEyebrow}
              en={form.heroEyebrowEn}
              az={form.heroEyebrowAz}
              onTrChange={(v) => alanGuncelle("heroEyebrow", v)}
              onEnChange={(v) => alanGuncelle("heroEyebrowEn", v)}
              onAzChange={(v) => alanGuncelle("heroEyebrowAz", v)}
            />
            <DilSekmeli
              etiket="Başlık"
              tr={form.heroBaslik}
              en={form.heroBaslikEn}
              az={form.heroBaslikAz}
              onTrChange={(v) => alanGuncelle("heroBaslik", v)}
              onEnChange={(v) => alanGuncelle("heroBaslikEn", v)}
              onAzChange={(v) => alanGuncelle("heroBaslikAz", v)}
              textarea
              rows={2}
            />
          </div>
          <p className="text-xs text-metin/45 -mt-2">
            Başlıkta *yıldız içine alınan* kısım vurgulu (accent renkli) gösterilir — ör. &quot;Nefesinizin
            *hızında* bir yoga pratiği.&quot; Bu işaretleme her dilde aynı şekilde kullanılabilir.
          </p>
          <DilSekmeli
            etiket="Alt başlık"
            tr={form.heroAltBaslik}
            en={form.heroAltBaslikEn}
            az={form.heroAltBaslikAz}
            onTrChange={(v) => alanGuncelle("heroAltBaslik", v)}
            onEnChange={(v) => alanGuncelle("heroAltBaslikEn", v)}
            onAzChange={(v) => alanGuncelle("heroAltBaslikAz", v)}
            textarea
            rows={2}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <DilSekmeli
              etiket="Birincil buton metni"
              tr={form.heroCtaBirincil}
              en={form.heroCtaBirincilEn}
              az={form.heroCtaBirincilAz}
              onTrChange={(v) => alanGuncelle("heroCtaBirincil", v)}
              onEnChange={(v) => alanGuncelle("heroCtaBirincilEn", v)}
              onAzChange={(v) => alanGuncelle("heroCtaBirincilAz", v)}
            />
            <DilSekmeli
              etiket="İkincil buton metni"
              tr={form.heroCtaIkincil}
              en={form.heroCtaIkincilEn}
              az={form.heroCtaIkincilAz}
              onTrChange={(v) => alanGuncelle("heroCtaIkincil", v)}
              onEnChange={(v) => alanGuncelle("heroCtaIkincilEn", v)}
              onAzChange={(v) => alanGuncelle("heroCtaIkincilAz", v)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-body text-sm uppercase tracking-wide text-metin/50 mb-4">Üyelik bölümü başlığı</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <DilSekmeli
            etiket="Eyebrow"
            tr={form.uyelikEyebrow}
            en={form.uyelikEyebrowEn}
            az={form.uyelikEyebrowAz}
            onTrChange={(v) => alanGuncelle("uyelikEyebrow", v)}
            onEnChange={(v) => alanGuncelle("uyelikEyebrowEn", v)}
            onAzChange={(v) => alanGuncelle("uyelikEyebrowAz", v)}
          />
          <DilSekmeli
            etiket="Başlık"
            tr={form.uyelikBaslik}
            en={form.uyelikBaslikEn}
            az={form.uyelikBaslikAz}
            onTrChange={(v) => alanGuncelle("uyelikBaslik", v)}
            onEnChange={(v) => alanGuncelle("uyelikBaslikEn", v)}
            onAzChange={(v) => alanGuncelle("uyelikBaslikAz", v)}
          />
          <DilSekmeli
            etiket="Alt başlık"
            tr={form.uyelikAltBaslik}
            en={form.uyelikAltBaslikEn}
            az={form.uyelikAltBaslikAz}
            onTrChange={(v) => alanGuncelle("uyelikAltBaslik", v)}
            onEnChange={(v) => alanGuncelle("uyelikAltBaslikEn", v)}
            onAzChange={(v) => alanGuncelle("uyelikAltBaslikAz", v)}
          />
        </div>
        <p className="text-xs text-metin/45 mt-2">
          Plan kartlarının kendisi (fiyat, özellikler) burada değil, Fiyatlandırma sayfasında düzenlenir.
        </p>
      </div>

      <div className={alan.includes("hidden") ? "hidden" : "flex justify-end"}>
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
