import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Kullanım Şartları — LucidMove",
  description: "LucidMove üyelik ve video hizmetinin kullanım şartları.",
};

export const dynamic = "force-dynamic";

export default async function KullanimSartlari() {
  const ayarlar = await getSiteSettings();

  return (
    <div className="container-nefes py-20 max-w-2xl">
      <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-4">Yasal</p>
      <h1 className="font-display text-4xl font-bold text-metin leading-tight">Kullanım Şartları</h1>
      <p className="font-body text-sm text-metin/50 mt-3">
        Son güncelleme: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date())}
      </p>

      <div className="font-body text-metin/75 mt-10 space-y-8 leading-relaxed">
        <p className="text-sm bg-vurgu/10 border border-vurgu/30 rounded-xl p-4">
          Bu metin genel bir taslak niteliğindedir; işletmenize özgü yasal
          yükümlülükleriniz için bir hukuk danışmanına başvurmanızı öneririz.
        </p>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">1. Taraflar ve Kapsam</h2>
          <p>
            Bu Kullanım Şartları, LucidMove (&quot;Platform&quot;) üzerinden sunulan aylık veya yıllık
            üyelik esaslı yoga video hizmetinin kullanımına ilişkin koşulları düzenler.
            Platforma üye olan veya kullanan her kişi (&quot;Üye&quot;) bu şartları kabul etmiş sayılır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">2. Hizmetin Tanımı</h2>
          <p>
            LucidMove, tek eğitmen tarafından hazırlanan yoga derslerine, aktif bir üyelik
            karşılığında sınırsız erişim sağlayan bir video kütüphanesidir. Bazı dersler
            tanıtım amacıyla ücretsiz olarak sunulabilir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">3. Üyelik ve Ödeme</h2>
          <p>
            Üyelik, seçilen plana (aylık veya yıllık) göre Iyzico güvenli ödeme altyapısı
            üzerinden tahsil edilir. Kart bilgileriniz Platform sunucularında saklanmaz.
            Fiyatlar {ayarlar.siteBasligi.split("—")[0].trim()} tarafından güncellenebilir; güncel
            fiyatlar her zaman üyelik sayfasında gösterilir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">4. İptal ve Erişim Süresi</h2>
          <p>
            Üyeliğinizi hesabım sayfanızdan dilediğiniz zaman iptal edebilirsiniz. İptal
            işlemi bir sonraki dönem için yeniden tahsilatı durdurur; mevcut ödenmiş dönem
            sonuna kadar erişiminiz devam eder. Kısmi iade yapılmaz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">5. İçerik Kullanım Kuralları</h2>
          <p>
            Video içerikleri yalnızca kişisel, ticari olmayan kullanım içindir. Videoların
            indirilmesi, kopyalanması, kayda alınması, çoğaltılması veya üçüncü kişilerle
            paylaşılması yasaktır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">6. Fikri Mülkiyet</h2>
          <p>
            Platform üzerindeki tüm video, metin, görsel ve marka unsurları LucidMove&apos;a
            veya ilgili hak sahiplerine aittir; önceden yazılı izin olmaksızın
            çoğaltılamaz veya dağıtılamaz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">7. Sorumluluk Sınırlaması</h2>
          <p>
            Dersler genel egzersiz içeriği niteliğindedir, tıbbi tavsiye yerine geçmez.
            Herhangi bir sağlık sorununuz varsa derslere başlamadan önce bir sağlık
            uzmanına danışmanız önerilir. Platform, hizmetin kesintisiz veya hatasız
            olacağını garanti etmez.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">8. Değişiklikler</h2>
          <p>
            Bu şartlar zaman zaman güncellenebilir. Önemli değişiklikler Platform
            üzerinden duyurulur; hizmeti kullanmaya devam etmeniz güncel şartları kabul
            ettiğiniz anlamına gelir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">9. İletişim</h2>
          <p>
            Sorularınız için {ayarlar.iletisimEmail} adresinden bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
