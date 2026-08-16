import Link from "next/link";

// Kullanım Kılavuzu'nun içerik gövdesi — Yardım > Kullanım Kılavuzu sayfasında
// (bkz. page.tsx) render edilir. Panelin her bölümünü kısaca anlatan, elle
// tutulan bir referans metin; yeni bir admin bölümü eklendiğinde burası da
// güncellenmeli (bkz. lib/changelogVerisi.ts'teki benzer not).

function Alt({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display font-bold text-metin mt-7 mb-2 first:mt-0">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-sm text-metin/70 leading-relaxed">{children}</p>;
}

function Liste({ children }: { children: React.ReactNode }) {
  return <ul className="mt-2 space-y-1.5 list-disc pl-5 text-sm text-metin/70 font-body leading-relaxed">{children}</ul>;
}

function Kod({ children }: { children: React.ReactNode }) {
  return <code className="text-xs bg-zemin border border-cizgi rounded px-1.5 py-0.5 font-mono text-metin/80">{children}</code>;
}

const BOLUMLER = [
  { id: "genel-bakis", baslik: "Genel Bakış" },
  { id: "icerik", baslik: "İçerik Yönetimi" },
  { id: "ticaret", baslik: "Ticaret" },
  { id: "iletisim-raporlar", baslik: "İletişim & Raporlar" },
  { id: "ayarlar", baslik: "Ayarlar" },
  { id: "uye-tarafi", baslik: "Üye Tarafı" },
  { id: "guvenlik", baslik: "Yetkilendirme & Güvenlik" },
];

export default function KullanimKilavuzu() {
  return (
    <div className="space-y-6">
      {/* İçindekiler */}
      <div className="rounded-2xl bg-kart border border-cizgi shadow-organik p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-metin/40 mb-3">İçindekiler</p>
        <nav className="flex flex-wrap gap-2">
          {BOLUMLER.map((b) => (
            <a
              key={b.id}
              href={`#${b.id}`}
              className="text-sm font-body text-vurgu hover:text-vurgu-dark bg-vurgu/5 hover:bg-vurgu/10 rounded-full px-3.5 py-1.5 transition-colors"
            >
              {b.baslik}
            </a>
          ))}
        </nav>
      </div>

      <div id="genel-bakis" className="scroll-mt-20 rounded-2xl bg-kart border border-cizgi shadow-organik p-7">
        <h2 className="font-display text-xl font-bold text-metin mb-4">Genel Bakış</h2>
        <P>
          Admin paneli üç ana alandan oluşur: solda (masaüstünde sabit) günlük içerik/ticaret işlerini gruplayan bir
          menü, üstte o an bulunduğunuz sayfanın adını gösteren bir başlık şeridi, ve sağ üstte kullanıcı menünüz.
        </P>
        <Liste>
          <li>Sol menü dört grupta toplanır: İçerik, Ticaret, İletişim, Raporlar.</li>
          <li>
            Sağ üstteki isim/baş harf rozetine tıklayınca açılan menüden — yetkiniz varsa — <Kod>Ayarlar</Kod>&rsquo;a,
            her zaman <Kod>Yardım</Kod>&rsquo;a (şu an okuduğunuz sayfa) ve çıkışa ulaşırsınız.
          </li>
          <li>Bazı sayfaların üst kısmında, o bölüme özel bir aksiyon butonu (ör. &ldquo;Yeni kurs&rdquo;) veya alt sekme şeridi bulunur.</li>
          <li>Panel ana sayfasında (Panel) genel istatistikler ve — yapılandırılmışsa — gerçek zamanlı Google Analytics grafikleri yer alır.</li>
        </Liste>
      </div>

      <div id="icerik" className="scroll-mt-20 rounded-2xl bg-kart border border-cizgi shadow-organik p-7">
        <h2 className="font-display text-xl font-bold text-metin mb-1">İçerik Yönetimi</h2>
        <P>Site içeriğinin omurgası: Kurs → Ders yapısı.</P>

        <Alt>Kurslar ve Dersler</Alt>
        <P>
          Bir kursu düzenlerken üstte iki sekme görürsünüz: <strong>Kurs bilgileri</strong> (başlık, açıklama, kapak
          görseli, kategori) ve <strong>Dersler</strong>.
        </P>
        <Liste>
          <li>Her ders, daraltılmış bir özet kart olarak listelenir — karta tıklayınca düzenleme alanları açılır.</li>
          <li>
            Ders videosu yüklenirken (mp4/webm/ogg/mov, en fazla 2 GB) dosya otomatik olarak parçalara bölünüp sırayla
            gönderilir; bağlantı kesilirse yalnızca yarıda kalan parça yeniden denenir, baştan başlamaz.
          </li>
          <li>
            Video dosyası seçilir seçilmez — yükleme bitmeden — süresi tarayıcıda otomatik okunup &ldquo;Süre
            (dk)&rdquo; alanına yazılır; isterseniz elle düzeltebilirsiniz.
          </li>
          <li>
            Ders sırası artık elle sayı girilerek değil, kartın soldaki tutamacından (⠿) sürükleyip bırakarak
            belirlenir. Bir kart açıkken (düzenleme sırasında) sürükleme, yanlışlıkla taşınmasın diye geçici olarak
            kapalıdır.
          </li>
          <li>Kapak görseli, videodan bir kare seçilerek de oluşturulabilir.</li>
          <li>&ldquo;Ücretsiz tanıtım&rdquo; işaretli dersler, üyeliği olmayan ziyaretçilere de açık izlenebilir.</li>
          <li>
            Her derse opsiyonel bir &ldquo;Mood&rdquo; (ruh hali) etiketi verilebilir — herkese açık{" "}
            <Kod>/courses</Kod> sayfasındaki &ldquo;Moodlar&rdquo; bölümü, en az bir dersi o etikete sahip olan
            kursları filtrelemek için kullanılır.
          </li>
        </Liste>
        <P>
          Kurs kataloğu (<Kod>/courses</Kod>) herkese açıktır: üstte kurs adlarından oluşan sekmeler + arama, altında
          seviyeye göre, ardından mood&apos;a göre görsel filtre kartları, en altta her kurs kendi başlığıyla ve
          içindeki derslerle listelenir. Aktif üyeliği olmayan bir ziyaretçi, ders kartının üzerine gelince kilit
          simgesi ve &ldquo;Üye ol&rdquo; ipucu görür.
        </P>

        <Alt>Moodlar</Alt>
        <P>
          Ders etiketlemede kullanılan mood listesi (Enerji Ver, Güçlen, Besle, Rahatla gibi) admin panelinden
          eklenip düzenlenebilir. Her mood&apos;a opsiyonel bir kapak görseli verilebilir — Kurslar sayfasındaki
          &ldquo;Moodlar&rdquo; bölümünde bu görsel gösterilir, yoksa kart düz renkle görünür. Bir mood silinirse ona
          sahip derslerdeki etiket sessizce kaldırılır, bir hata oluşmaz.
        </P>

        <Alt>Yorumlar</Alt>
        <P>
          Panelden yönetilen yorumlar (isim, rol, metin) şu an anasayfada gösterilmiyor — içerik burada durmaya
          devam ediyor, ileride tekrar bir bölümde kullanılabilir.
        </P>
      </div>

      <div id="ticaret" className="scroll-mt-20 rounded-2xl bg-kart border border-cizgi shadow-organik p-7">
        <h2 className="font-display text-xl font-bold text-metin mb-1">Ticaret</h2>
        <P>Fiyatlandırma, üyeler ve abonelik/ödeme yönetimi.</P>

        <Alt>Fiyatlandırma</Alt>
        <P>Aylık/yıllık plan kartlarının fiyatı, açıklaması, özellik listesi ve öne çıkan rozeti buradan düzenlenir.</P>

        <Alt>Üyeler</Alt>
        <P>
          En az bir satın alımı olan üyelerin (yalnızca ÜYE rolündeki hesaplar — admin hesapları burada hiç görünmez)
          güncel üyelik durumunu özetleyen tek satırlık liste. &ldquo;Yeni üye ekle&rdquo; ile panelden doğrudan bir
          üye hesabı açabilirsiniz.
        </P>

        <Alt>Üyelikler</Alt>
        <P>
          Üyeler sayfasından farklı olarak, her abonelik kaydı burada ayrı bir satırdır (bir kişinin birden fazla
          geçmiş aboneliği olabilir). Aktif bir aboneliği iptal etmek buradan yapılır.
        </P>
        <Liste>
          <li>
            &ldquo;Manuel ödeme ekle&rdquo;: Iyzico dışında alınan bir ödemeyi (banka havalesi, elden vb.) kaydedip
            üyeye doğrudan aktif bir abonelik tanımlar.
          </li>
        </Liste>
      </div>

      <div id="iletisim-raporlar" className="scroll-mt-20 rounded-2xl bg-kart border border-cizgi shadow-organik p-7">
        <h2 className="font-display text-xl font-bold text-metin mb-1">İletişim &amp; Raporlar</h2>

        <Alt>Mesajlar</Alt>
        <P>Sitedeki iletişim formundan gelen mesajlar, en yeniden eskiye doğru listelenir.</P>

        <Alt>Raporlar</Alt>
        <P>Üç sekmeden oluşur:</P>
        <Liste>
          <li><strong>Kullanıcılar</strong> — her üyenin kayıt tarihi, üyelik durumu, toplam ödemesi ve tamamladığı ders sayısı.</li>
          <li><strong>İzlenmeler</strong> — hangi dersin ne kadar izlendiğine dair detay.</li>
          <li><strong>Ödemeler</strong> — tüm ödeme kayıtlarının dökümü.</li>
        </Liste>
      </div>

      <div id="ayarlar" className="scroll-mt-20 rounded-2xl bg-kart border border-cizgi shadow-organik p-7">
        <h2 className="font-display text-xl font-bold text-metin mb-1">Ayarlar</h2>
        <P>
          Kullanıcı menüsündeki &ldquo;Ayarlar&rdquo; linkinden ulaşılır — yalnızca size (veya rolünüze) erişim
          verilmiş sayfaları görürsünüz, bkz. aşağıdaki &ldquo;Yetkilendirme &amp; Güvenlik&rdquo; bölümü.
        </P>

        <Alt>Genel Ayarlar</Alt>
        <P>Para birimi, Google Analytics (Measurement ID + raporlama için servis hesabı), site iletişim bilgileri ve SEO ayarları.</P>

        <Alt>Sayfa Tasarımı</Alt>
        <P>Anasayfa hero görseli, &ldquo;Stüdyodan kareler&rdquo; galerisi ve eğitmen profili (Hakkımda bölümü).</P>

        <Alt>Kullanıcılar</Alt>
        <P>Yalnızca admin hesaplarını listeler (üyeler için bkz. Ticaret &gt; Üyeler). Yeni admin oluşturma, şifre değiştirme ve rol atama buradan yapılır.</P>

        <Alt>Roller</Alt>
        <P>Sayfa bazlı özel izin rolleri burada tanımlanır — bir role hangi admin sayfalarına (Ayarlar dahil, tek tek) erişim verileceği işaretlenir.</P>

        <Alt>Entegrasyon</Alt>
        <P>Iyzico bağlantı durumu (salt okunur), callback URL&rsquo;i ve sandbox test kartı bilgisi.</P>

        <Alt>Güncelleme</Alt>
        <P>Sunucudaki kodu git üzerinden günceller (fetch → merge → npm install → prisma migrate → build). Sunucudaki güncel sürüm burada görünür.</P>

        <Alt>Cache</Alt>
        <P>Anasayfa/kurs/ders sayfalarının önbelleğini elle tazeler. Normalde içerik değişikliği ilgili sayfayı zaten otomatik tazeler — bu yalnızca beklenmedik bir tutarsızlıkta kullanılacak bir güvenlik supabı.</P>

        <Alt>Yedekleme</Alt>
        <P>Veritabanının tam bir kopyasını (.sql.gz) elle alır, indirir veya siler. Otomatik/zamanlanmış yedekleme bu sürümde yok.</P>

        <Alt>Sistem Logları</Alt>
        <P>Panelde yapılan önemli işlemlerin (giriş, oluşturma/güncelleme/silme, güncelleme vb.) denetim kaydı.</P>
      </div>

      <div id="uye-tarafi" className="scroll-mt-20 rounded-2xl bg-kart border border-cizgi shadow-organik p-7">
        <h2 className="font-display text-xl font-bold text-metin mb-1">Üye Tarafı</h2>
        <P>Sitedeki üyelerin (admin değil, ÜYE rolündeki hesapların) gördüğü panel de kısaca bilinmeye değer:</P>
        <Liste>
          <li>
            Üye giriş yaptığında <Kod>/account</Kod>&rsquo;a düşer — kurs kartları, genel ilerleme çubuğu ve son
            izlenen derslerin kısa bir listesiyle.
          </li>
          <li>
            Profil düzenleme (ad, e-posta, telefon, şifre, fotoğraf) ayrı bir sayfaya (<Kod>/account/profile</Kod>)
            taşındı — artık giriş sonrası ilk gördükleri sayfa değil.
          </li>
          <li>Bir ders videosu sonuna kadar izlenince ilerleme otomatik kaydedilir; bu hem üye panelinde hem admin Raporlar&rsquo;da görünür.</li>
        </Liste>
      </div>

      <div id="guvenlik" className="scroll-mt-20 rounded-2xl bg-kart border border-cizgi shadow-organik p-7">
        <h2 className="font-display text-xl font-bold text-metin mb-1">Yetkilendirme &amp; Güvenlik</h2>
        <P>İki tür admin yetkisi vardır:</P>
        <Liste>
          <li>
            <strong>Sistem yöneticisi</strong> — panelin tamamına erişir. Bu bayrağı yalnızca zaten sistem yöneticisi
            olan biri başka bir hesaba verebilir veya kaldırabilir.
          </li>
          <li>
            <strong>Özel rol</strong> — Ayarlar &gt; Roller&rsquo;de tanımlanan, yalnızca işaretli sayfalara erişen bir
            yetki kümesi. Ayarlar sayfaları dahil, her sayfa tek tek verilebilir.
          </li>
        </Liste>
        <Alt>Dikkat edilmesi gerekenler</Alt>
        <Liste>
          <li>
            Bir role &ldquo;Kullanıcılar&rdquo; veya &ldquo;Roller&rdquo; sayfasını vermek, o kişiye başka admin
            hesapları/roller üzerinde etki alanı kazandırır — yalnızca gerçekten güvendiğiniz kişilere verin.
          </li>
          <li>&ldquo;Güncelleme&rdquo; sayfası sunucudaki kodu değiştirip yeniden başlatabilir — aynı şekilde dikkatli verilmeli.</li>
          <li>
            Bu sınırlar sistem tarafından da otomatik uygulanır: özel rolü olan biri kendi erişemediği bir sayfayı
            içeren bir rol oluşturamaz/atayamaz ve sistem yöneticisi hesaplarını hiçbir şekilde görüntüleyip
            düzenleyemez.
          </li>
        </Liste>
      </div>

      <p className="font-body text-xs text-metin/40 text-center pt-2">
        Bir şey eksik veya güncel değilse — bu sayfa da bir dosyadır, geliştirenle (Claude Code oturumunda) güncellenebilir.
        Bkz. <Link href="/admin/help/changelog" className="text-vurgu hover:text-vurgu-dark">Güncelleme Geçmişi</Link>.
      </p>
    </div>
  );
}
