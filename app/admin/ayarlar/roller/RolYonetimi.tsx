"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

interface SayfaGrubu {
  baslik: string;
  sayfalar: { href: string; label: string }[];
}

interface Rol {
  id: string;
  ad: string;
  sayfalar: string[];
  _count: { kullanicilar: number };
}

function SayfaSecici({
  sayfaGruplari,
  secili,
  onDegistir,
}: {
  sayfaGruplari: SayfaGrubu[];
  secili: string[];
  onDegistir: (href: string, isaretli: boolean) => void;
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {sayfaGruplari.map((grup) => (
        <div key={grup.baslik}>
          <p className="font-mono text-[11px] uppercase tracking-wide text-metin/40 mb-2">{grup.baslik}</p>
          <div className="space-y-1.5">
            {grup.sayfalar.map((s) => (
              <label key={s.href} className="flex items-center gap-2 text-sm text-metin/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={secili.includes(s.href)}
                  onChange={(e) => onDegistir(s.href, e.target.checked)}
                  className="accent-vurgu"
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RolSatiri({ rol, sayfaGruplari }: { rol: Rol; sayfaGruplari: SayfaGrubu[] }) {
  const router = useRouter();
  const toast = useToast();
  const [duzenleAcik, setDuzenleAcik] = useState(false);
  const [ad, setAd] = useState(rol.ad);
  const [sayfalar, setSayfalar] = useState<string[]>(rol.sayfalar);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);

  function sayfaDegistir(href: string, isaretli: boolean) {
    setSayfalar((s) => (isaretli ? [...s, href] : s.filter((x) => x !== href)));
  }

  async function kaydet() {
    setGonderiliyor(true);
    const res = await fetch(`/api/admin/roller/${rol.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, sayfalar }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Rol güncellendi.");
    setDuzenleAcik(false);
    router.refresh();
  }

  async function sil() {
    if (
      !confirm(
        `"${rol.ad}" rolünü silmek istediğinize emin misiniz? Bu role atanmış ${rol._count.kullanicilar} kullanıcı varsayılan admin erişimine döner.`
      )
    )
      return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/roller/${rol.id}`, { method: "DELETE" });
      if (!res.ok) {
        const veri = await res.json();
        toast.error(veri.hata || "Rol silinemedi");
        return;
      }
      toast.success("Rol silindi.");
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  if (!duzenleAcik) {
    return (
      <div className="flex items-center justify-between gap-4 border border-cizgi rounded-lg px-4 py-3">
        <div>
          <p className="text-sm text-metin font-medium">{rol.ad}</p>
          <p className="text-xs text-metin/45 mt-0.5">
            {rol.sayfalar.length} sayfa · {rol._count.kullanicilar} kullanıcı
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button onClick={() => setDuzenleAcik(true)} className="text-vurgu hover:text-vurgu-dark cursor-pointer">
            Düzenle
          </button>
          <button onClick={sil} disabled={siliniyor} className="text-red-700 hover:text-red-900 disabled:opacity-50 cursor-pointer">
            {siliniyor ? "Siliniyor…" : "Sil"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-cizgi rounded-lg p-4 bg-zemin space-y-4">
      <div>
        <label className="block text-xs text-metin/50 mb-1.5">Rol adı</label>
        <input
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          className="w-full sm:w-72 border border-cizgi rounded-lg px-3 py-2.5 bg-kart text-metin text-sm focus:border-vurgu outline-none"
        />
      </div>
      <div>
        <p className="text-xs text-metin/50 mb-2">Erişebileceği sayfalar</p>
        <SayfaSecici sayfaGruplari={sayfaGruplari} secili={sayfalar} onDegistir={sayfaDegistir} />
      </div>
      <div className="flex items-center justify-end gap-4">
        <button onClick={() => setDuzenleAcik(false)} className="text-metin/50 text-xs hover:text-metin cursor-pointer">
          Vazgeç
        </button>
        <button
          onClick={kaydet}
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-4 py-2 rounded-lg text-xs hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}

function YeniRolFormu({ sayfaGruplari }: { sayfaGruplari: SayfaGrubu[] }) {
  const router = useRouter();
  const toast = useToast();
  const [acik, setAcik] = useState(false);
  const [ad, setAd] = useState("");
  const [sayfalar, setSayfalar] = useState<string[]>([]);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  function sayfaDegistir(href: string, isaretli: boolean) {
    setSayfalar((s) => (isaretli ? [...s, href] : s.filter((x) => x !== href)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);
    const res = await fetch("/api/admin/roller", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, sayfalar }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Rol oluşturuldu.");
    setAd("");
    setSayfalar([]);
    setAcik(false);
    router.refresh();
  }

  if (!acik) {
    return (
      <button
        onClick={() => setAcik(true)}
        className="border border-cizgi text-metin px-4 py-2.5 rounded-lg text-sm hover:border-vurgu transition-colors cursor-pointer"
      >
        + Yeni rol ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-cizgi rounded-lg p-4 space-y-4">
      <div>
        <label className="block text-xs text-metin/50 mb-1.5">Rol adı</label>
        <input
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          required
          placeholder="ör. İçerik editörü"
          className="w-full sm:w-72 border border-cizgi rounded-lg px-3 py-2.5 bg-zemin text-metin text-sm focus:border-vurgu outline-none"
        />
      </div>
      <div>
        <p className="text-xs text-metin/50 mb-2">Erişebileceği sayfalar</p>
        <SayfaSecici sayfaGruplari={sayfaGruplari} secili={sayfalar} onDegistir={sayfaDegistir} />
      </div>
      <div className="flex items-center justify-end gap-4">
        <button type="button" onClick={() => setAcik(false)} className="text-metin/50 text-xs hover:text-metin cursor-pointer">
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-4 py-2 rounded-lg text-xs hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Ekleniyor…" : "Ekle"}
        </button>
      </div>
    </form>
  );
}

export default function RolYonetimi({ roller, sayfaGruplari }: { roller: Rol[]; sayfaGruplari: SayfaGrubu[] }) {
  return (
    <div className="space-y-3">
      {roller.length === 0 && <p className="font-body text-sm text-metin/50">Henüz özel rol oluşturulmadı.</p>}
      {roller.map((r) => (
        <RolSatiri key={r.id} rol={r} sayfaGruplari={sayfaGruplari} />
      ))}
      <YeniRolFormu sayfaGruplari={sayfaGruplari} />
    </div>
  );
}
