import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — LucidMove",
  description: "LucidMove kişisel verilerin işlenmesine ilişkin gizlilik politikası.",
};

export const dynamic = "force-dynamic";

export default async function GizlilikPolitikasi() {
  const ayarlar = await getSiteSettings();

  return (
    <div className="container-nefes py-20 max-w-2xl">
      <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu mb-4">Yasal</p>
      <h1 className="font-display text-4xl font-bold text-metin leading-tight">Gizlilik Politikası</h1>
      <p className="font-body text-sm text-metin/50 mt-3">
        Son güncelleme: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date())}
      </p>

      <div className="font-body text-metin/75 mt-10 space-y-8 leading-relaxed">
        <p className="text-sm bg-vurgu/10 border border-vurgu/30 rounded-xl p-4">
          Bu metin genel bir taslak niteliğindedir; 6698 sayılı Kişisel Verilerin
          Korunması Kanunu (&quot;KVKK&quot;) kapsamındaki yükümlülükleriniz için bir hukuk
          danışmanına başvurmanızı öneririz.
        </p>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">1. Toplanan Veriler</h2>
          <p>
            Üyelik oluştururken ad-soyad, e-posta adresi ve şifreniz (şifrelenmiş
            olarak) alınır. Üyelik satın alırken ödeme işlemi Iyzico üzerinden
            gerçekleşir; kart bilgileriniz Platform sunucularına hiçbir zaman
            ulaşmaz. Dilerseniz hesabım sayfanızdan bir profil fotoğrafı
            yükleyebilirsiniz. Video izleme etkileşimleriniz, hizmeti
            geliştirmek amacıyla kayıt altına alınabilir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">2. Verilerin Kullanım Amacı</h2>
          <p>
            Toplanan veriler; üyelik ve ödeme süreçlerinin yürütülmesi, hesabınıza
            erişim sağlanması, destek taleplerinize yanıt verilmesi ve yasal
            yükümlülüklerin yerine getirilmesi amacıyla işlenir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">3. Saklama ve Güvenlik</h2>
          <p>
            Şifreniz geri döndürülemez şekilde şifrelenerek saklanır. Verileriniz,
            yalnızca hizmetin sunulması için gerekli süre boyunca ve makul güvenlik
            önlemleriyle korunarak tutulur.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">4. Üçüncü Taraflarla Paylaşım</h2>
          <p>
            Ödeme bilgileriniz yalnızca ödemeyi işlemek amacıyla Iyzico ile
            paylaşılır. Verileriniz, yasal zorunluluklar dışında pazarlama
            amacıyla üçüncü kişilerle paylaşılmaz veya satılmaz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">5. Çerezler</h2>
          <p>
            Platform, oturumunuzu açık tutmak (giriş durumu) için zorunlu
            çerezler kullanır. Bu çerezler olmadan üyelik özellikleri çalışmaz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">6. Haklarınız</h2>
          <p>
            KVKK kapsamında verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini
            veya silinmesini talep etme haklarına sahipsiniz. Bu taleplerinizi{" "}
            {ayarlar.iletisimEmail} adresine ileterek kullanabilirsiniz. Hesabınızı ve
            profil bilgilerinizi hesabım sayfanızdan doğrudan düzenleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-metin mb-2">7. İletişim</h2>
          <p>
            Gizlilikle ilgili sorularınız için {ayarlar.iletisimEmail} adresinden bize
            ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
