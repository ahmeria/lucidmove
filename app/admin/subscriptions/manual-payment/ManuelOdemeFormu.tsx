"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useToast } from "@/components/Toast";

type Kullanici = { id: string; ad: string; email: string };
type Plan = "AYLIK" | "YILLIK";

export default function ManuelOdemeFormu({
  kullanicilar,
  planFiyatlari,
}: {
  kullanicilar: Kullanici[];
  planFiyatlari: Record<string, string>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState<Plan>("AYLIK");
  const [tutar, setTutar] = useState(planFiyatlari.AYLIK ?? "");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  function planDegisti(yeniPlan: Plan) {
    setPlan(yeniPlan);
    setTutar(planFiyatlari[yeniPlan] ?? "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) {
      toast.error("Bir üye seçin");
      return;
    }
    setGonderiliyor(true);
    const res = await fetch("/api/admin/subscriptions/manual-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, plan, tutar }),
    });
    const veri = await res.json();
    setGonderiliyor(false);
    if (!res.ok) {
      toast.error(veri.hata || "Bir hata oluştu");
      return;
    }
    toast.success("Manuel ödeme kaydedildi, üyelik aktifleştirildi.");
    router.push("/admin/subscriptions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body max-w-lg">
      <p className="text-sm text-metin/60 -mt-1">
        Iyzico dışında (banka havalesi, elden vb.) alınan bir ödemeyi burada kaydedip üyeye doğrudan aktif abonelik
        tanımlayabilirsiniz.
      </p>

      <div>
        <label className="block text-sm text-metin/70 mb-1.5">Üye</label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
        >
          <option value="">Seçin…</option>
          {kullanicilar.map((k) => (
            <option key={k.id} value={k.id}>
              {k.ad} — {k.email}
            </option>
          ))}
        </select>
        {kullanicilar.length === 0 && (
          <p className="text-xs text-metin/45 mt-1.5">
            Kayıtlı üye yok. Önce Ayarlar &gt; Kullanıcılar&apos;dan bir üye hesabı oluşturun.
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Plan</label>
          <select
            value={plan}
            onChange={(e) => planDegisti(e.target.value as Plan)}
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          >
            <option value="AYLIK">Aylık</option>
            <option value="YILLIK">Yıllık</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-metin/70 mb-1.5">Tutar (₺)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={tutar}
            onChange={(e) => setTutar(e.target.value)}
            required
            className="w-full border border-cizgi rounded-lg px-4 py-2.5 bg-zemin text-metin focus:border-vurgu outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="bg-metin text-zemin px-6 py-3 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Üyeliği aktifleştir"}
        </button>
      </div>
    </form>
  );
}
