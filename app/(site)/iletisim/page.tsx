import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import IletisimForm from "./IletisimForm";

export const metadata: Metadata = {
  title: "İletişim — LucidMove",
  description: "Sorularınız için bize ulaşın.",
};

export const dynamic = "force-dynamic";

export default async function Iletisim() {
  const ayarlar = await getSiteSettings();

  return (
    <div className="container-nefes py-20 grid lg:grid-cols-2 gap-14">
      <div>
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-4">İletişim</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-metin leading-tight">
          Aklınıza takılan bir şey mi var?
        </h1>
        <p className="font-body text-metin/70 mt-5 max-w-md leading-relaxed">
          Üyelik, ödeme veya bir dersle ilgili sorularınız için aşağıdaki formu
          doldurabilir ya da doğrudan yazabilirsiniz. Genellikle bir iş günü
          içinde dönüş yapıyoruz.
        </p>

        <div className="mt-10 space-y-4 font-body text-sm text-metin/75">
          <p><span className="text-metin/50">E-posta:</span> {ayarlar.iletisimEmail}</p>
          <p><span className="text-metin/50">Çalışma saatleri:</span> {ayarlar.calismaSaatleri}</p>
        </div>
      </div>

      <IletisimForm />
    </div>
  );
}
