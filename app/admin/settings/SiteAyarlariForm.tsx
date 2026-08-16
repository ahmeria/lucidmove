"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";
import DilSekmeli from "@/components/admin/DilSekmeli";

type Ayarlar = {
  siteBasligi: string;
  siteBasligiEn: string | null;
  siteBasligiAz: string | null;
  siteAciklamasi: string;
  siteAciklamasiEn: string | null;
  siteAciklamasiAz: string | null;
  iletisimEmail: string;
  calismaSaatleri: string;
  calismaSaatleriEn: string | null;
  calismaSaatleriAz: string | null;
  instagramUrl: string;
  footerTagline: string;
  footerTaglineEn: string | null;
  footerTaglineAz: string | null;
};

const alan = "w-full border border-cizgi rounded-lg px-3 py-2 bg-zemin text-metin text-sm focus:border-vurgu outline-none";
const etiket = "block text-sm text-metin/70 mb-1.5";

// Hero / Üyelik bölümü başlığı / Eğitmen profili bu sayfada değil, hemen
// üstteki "Hero & Üyelik" kartında (bkz. AnaSayfaMetinleriForm) — bu form
// yalnızca iletişim/sosyal bilgisi ve SEO metnini taşıyor. E-posta/Instagram
// URL'i gibi literal değerler tek dilde kalıyor (çevrilecek bir "metin"
// değiller); geri kalan prose alanları DilSekmeli ile TR/EN/AZ alıyor.
export default function SiteAyarlariForm({ ayarlar }: { ayarlar: Ayarlar }) {
  const router = useRouter();
  const toast = useToast();
  // NOT: "ayarlar" prop'u sayfa üzerinden TÜM SiteSettings satırını taşıyor
  // (AnaSayfaMetinleriForm ile paylaşılıyor) — `...ayarlar` ile TAMAMINI
  // spread'lemek, bu formun bilmediği (ör. Hero/Üyelik'e ait) alanları da
  // state'e/PATCH gövdesine taşır ve onlar henüz null'sa "/api/admin/settings"
  // 400 ile reddeder. Bu yüzden yalnızca bu formun sahip olduğu (Ayarlar
  // tipindeki) alanlar tek tek seçiliyor.
  const [form, setForm] = useState({
    siteBasligi: ayarlar.siteBasligi,
    siteBasligiEn: ayarlar.siteBasligiEn ?? "",
    siteBasligiAz: ayarlar.siteBasligiAz ?? "",
    siteAciklamasi: ayarlar.siteAciklamasi,
    siteAciklamasiEn: ayarlar.siteAciklamasiEn ?? "",
    siteAciklamasiAz: ayarlar.siteAciklamasiAz ?? "",
    iletisimEmail: ayarlar.iletisimEmail,
    calismaSaatleri: ayarlar.calismaSaatleri,
    calismaSaatleriEn: ayarlar.calismaSaatleriEn ?? "",
    calismaSaatleriAz: ayarlar.calismaSaatleriAz ?? "",
    instagramUrl: ayarlar.instagramUrl,
    footerTagline: ayarlar.footerTagline,
    footerTaglineEn: ayarlar.footerTaglineEn ?? "",
    footerTaglineAz: ayarlar.footerTaglineAz ?? "",
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
    toast.success("Site ayarları kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-body">
      <div>
        <h3 className="font-body text-sm uppercase tracking-wide text-metin/50 mb-4">İletişim &amp; sosyal</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={etiket}>E-posta</label>
            <input
              type="email"
              value={form.iletisimEmail}
              onChange={(e) => alanGuncelle("iletisimEmail", e.target.value)}
              className={alan}
            />
          </div>
          <DilSekmeli
            etiket="Çalışma saatleri"
            tr={form.calismaSaatleri}
            en={form.calismaSaatleriEn}
            az={form.calismaSaatleriAz}
            onTrChange={(v) => alanGuncelle("calismaSaatleri", v)}
            onEnChange={(v) => alanGuncelle("calismaSaatleriEn", v)}
            onAzChange={(v) => alanGuncelle("calismaSaatleriAz", v)}
          />
          <div>
            <label className={etiket}>Instagram URL</label>
            <input
              value={form.instagramUrl}
              onChange={(e) => alanGuncelle("instagramUrl", e.target.value)}
              className={alan}
            />
          </div>
          <DilSekmeli
            etiket="Footer tagline"
            tr={form.footerTagline}
            en={form.footerTaglineEn}
            az={form.footerTaglineAz}
            onTrChange={(v) => alanGuncelle("footerTagline", v)}
            onEnChange={(v) => alanGuncelle("footerTaglineEn", v)}
            onAzChange={(v) => alanGuncelle("footerTaglineAz", v)}
          />
        </div>
      </div>

      <div>
        <h3 className="font-body text-sm uppercase tracking-wide text-metin/50 mb-4">SEO</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <DilSekmeli
            etiket="Site başlığı"
            tr={form.siteBasligi}
            en={form.siteBasligiEn}
            az={form.siteBasligiAz}
            onTrChange={(v) => alanGuncelle("siteBasligi", v)}
            onEnChange={(v) => alanGuncelle("siteBasligiEn", v)}
            onAzChange={(v) => alanGuncelle("siteBasligiAz", v)}
          />
          <DilSekmeli
            etiket="Site açıklaması"
            tr={form.siteAciklamasi}
            en={form.siteAciklamasiEn}
            az={form.siteAciklamasiAz}
            onTrChange={(v) => alanGuncelle("siteAciklamasi", v)}
            onEnChange={(v) => alanGuncelle("siteAciklamasiEn", v)}
            onAzChange={(v) => alanGuncelle("siteAciklamasiAz", v)}
            textarea
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end">
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
