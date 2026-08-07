"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

// Normalde /kayit üzerinden üye olunup admin panelden rol yükseltilir; bu
// form, sistem yöneticisinin panelden doğrudan bir hesap açmasını sağlayan
// kısayol (bkz. app/api/admin/kullanicilar > POST).
export default function YeniKullaniciFormu({ roller }: { roller: { id: string; ad: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [role, setRole] = useState("UYE");
  const [sistemYoneticisiMi, setSistemYoneticisiMi] = useState(false);
  const [adminRoleId, setAdminRoleId] = useState("");
  const [sifre, setSifre] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (sifre.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı");
      return;
    }

    setGonderiliyor(true);
    const res = await fetch("/api/admin/kullanicilar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad,
        email,
        telefon,
        role,
        sistemYoneticisiMi,
        adminRoleId: sistemYoneticisiMi ? null : adminRoleId || null,
        sifre,
      }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Kullanıcı oluşturuldu.");
    router.push("/admin/ayarlar/kullanicilar");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Ad Soyad</label>
          <input
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            required
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Telefon (opsiyonel)</label>
          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          >
            <option value="UYE">Üye</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Şifre</label>
        <input
          type="password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          required
          minLength={8}
          placeholder="En az 8 karakter"
          autoComplete="new-password"
          className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
        />
      </div>

      {role === "ADMIN" && (
        <>
          <label className="flex items-center gap-2 text-sm text-metin/70">
            <input
              type="checkbox"
              checked={sistemYoneticisiMi}
              onChange={(e) => setSistemYoneticisiMi(e.target.checked)}
            />
            Sistem yöneticisi — Ayarlar bölümüne (Kullanıcılar, Roller, Cache, Yedekleme, Sistem Logları) erişebilir
          </label>

          {!sistemYoneticisiMi && (
            <div>
              <label className="block text-sm text-metin/70 mb-1.5">Panel rolü</label>
              <select
                value={adminRoleId}
                onChange={(e) => setAdminRoleId(e.target.value)}
                className="w-full sm:w-72 border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
              >
                <option value="">Varsayılan (tüm içerik sayfaları)</option>
                {roller.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.ad}
                  </option>
                ))}
              </select>
              <p className="text-xs text-metin/45 mt-1.5">
                Özel bir rol seçilirse, bu kullanıcı yalnızca o rolün izin verdiği sayfaları görebilir. Rolleri{" "}
                <Link href="/admin/ayarlar/roller" className="text-vurgu hover:text-vurgu-dark">
                  buradan
                </Link>{" "}
                yönetebilirsiniz.
              </p>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Oluşturuluyor…" : "Kullanıcı oluştur"}
        </button>
      </div>
    </form>
  );
}
