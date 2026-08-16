// Admin panelindeki Yardım > Güncelleme Geçmişi sayfasında (bkz.
// app/admin/help/changelog/page.tsx) gösterilen, elle tutulan sürüm notları.
//
// Bu, git commit geçmişinin ham dökümü DEĞİL — okunabilir, admin'e yönelik
// bir özet. package.json'daki "version" alanıyla birlikte GÜNCEL tutulmalı:
// her anlamlı sürüm artışında (bkz. README/geçmiş commit mesajlarındaki
// "vX.Y.Z — ..." deseni) buraya da en üste yeni bir girdi eklenmeli.
export interface SurumGirdisi {
  surum: string;
  tarih: string; // YYYY-MM-DD
  baslik: string;
  degisiklikler: string[];
}

// En yeni sürüm en üstte.
export const GUNCELLEME_GECMISI: SurumGirdisi[] = [
  {
    surum: "3.2.0",
    tarih: "2026-08-16",
    baslik: "Site 3 dilli oldu (TR/EN/AZ), sayfa tasarımı tam CMS'e dönüştü",
    degisiklikler: [
      "Site artık Türkçe (varsayılan, öneksiz), İngilizce (/en) ve Azerbaycan dilinde (/az) yayında — sağ üstte bir dil seçici eklendi, dil değiştirince aynı sayfanın diğer dildeki karşılığına geçiliyor.",
      "Anasayfanın (Hero, Üyelik başlığı, Eğitmen profili/Hakkımda) TÜM metinleri artık panelden düzenlenebiliyor ve TR/EN/AZ ayrı ayrı girilebiliyor; boş bırakılan EN/AZ alanları otomatik Türkçe'ye düşüyor.",
      "Kurs ve ders başlık/açıklamaları, seviye etiketleri ve Mood adları da TR/EN/AZ ayrı ayrı girilebiliyor (kurs/ders arama-filtreleme mantığı değişmedi, yalnızca gösterilen etiketler çevriliyor).",
      "İletişim, Kullanım Şartları ve Gizlilik Politikası sayfaları da üç dilde.",
      "Admin ayarlarındaki \"Site & İletişim\" kartı Genel Ayarlar'dan Sayfa Tasarımı'na taşındı; Genel Ayarlar'a \"Varsayılan site dili\" seçeneği eklendi; Google Analytics ayarları Entegrasyon sayfasına taşındı.",
      "Admin panelinin kendisi değişmedi — tamamen Türkçe ve locale'siz kaldı, yalnızca YÖNETTİĞİ İÇERİK çok dilli.",
      "Anasayfa hero'sundaki arkaplan artık koşullu: panelden bir video yüklenirse video, yüklenmezse (veya kaldırılırsa) görsel doğrudan statik arkaplan olarak gösteriliyor.",
    ],
  },
  {
    surum: "3.1.0",
    tarih: "2026-08-16",
    baslik: "Video hero, yeni Kurslar sayfası, ders mood etiketi",
    degisiklikler: [
      "Anasayfa hero'su artık statik fotoğraf yerine (masaüstü/mobil için ayrı) arkaplan videosu kullanıyor; içerik ortalandı, alttaki boşluk giderildi.",
      "Anasayfa bölüm sırası değişti: Hero'dan hemen sonra Hakkımda geliyor, ardından Üyelik.",
      "Anasayfadaki Kurslar ve Yorumlar bölümleri kaldırıldı — kurs gözatma artık ayrı, herkese açık bir sayfada (/courses).",
      "Yeni: /courses sayfası — üstte seviyeye göre, altta mood'a göre (yeni) görsel filtre kartları; altında her kurs kendi başlığıyla, içindeki derslerin kartlarıyla listeleniyor. Aktif üyeliği olmayan ziyaretçi, ders kartının üzerine gelince kilit simgesi + \"Üye ol\" ipucu görür.",
      "Derslere opsiyonel bir \"Mood\" etiketi eklenebiliyor — kurs düzenleme sayfasından ayarlanır.",
      "Yeni: Admin > İçerik > Moodlar — mood listesi (Enerji Ver, Güçlen, Besle, Rahatla gibi) artık sabit kodlu değil, panelden eklenip düzenlenebiliyor; her mood'a kapak görseli verilebiliyor.",
      "/courses sayfasının üstüne kurs adlarından oluşan sekmeler, arama kutusu ve filtreleri tek tuşla temizleyen bir \"Filtrele\" butonu eklendi.",
      "/courses sayfasında \"Tümü\" görünümünde Seviyeler, Mood ve her kursun ders listesi, mobilde dikeyde uzayan bir ızgara yerine yana kaydırmalı (carousel) şeritler olarak gösteriliyor; üstten belirli bir kurs seçilince Seviyeler/Mood bölümleri gizlenip o kursun dersleri düz 2 sütunlu bir ızgarada listeleniyor.",
      "/courses sayfasında arama kutusu ve Filtrele butonu artık tam genişlikte, kurs sekmelerinin altında ayrı bir satırda.",
      "Mobil menü (hamburger) artık tam ekran bir panel olarak açılıyor: Kurslar/Üyelik/Hakkımda/İletişim + hesap işlemleri, sağa hizalı, büyük punto.",
      "Sitenin tamamında (kullanıcı menüleri dahil) içerik genişliği artırıldı (1180px → 1400px) — daha ferah bir yerleşim.",
      "Örnek derslere ve mood'lara demo kapak görselleri eklendi.",
      "Tek bir kursun sayfası (/courses/[kurs]) artık \"Ders Akışı\" adlı numaralı bir liste değil, /courses kataloğuyla aynı görsel kartlar ızgarası (görsel + süre · seviye · mood); ders/video sayfasındaki oynatıcı posteri de artık dersin kendi kapak görseli, başlığın altına seviye/mood bilgisi eklendi.",
      "Üyelik Paneli (/account) görsel olarak /courses sayfasıyla aynı dile kavuştu: kutulu/gölgeli kart çerçeveleri kaldırıldı, başlıklar /courses ile aynı stile geçti, ders/kurs kartları aynı sınırlı-çerçeve deseninde, vurgu rengi toprak tonuna geçti, kurs ızgarası geniş ekranda 4 sütuna çıktı, içinde ders olmayan kurslar artık listede görünmüyor. Gelişim özeti küçültülüp Profil ayarları düğmesinin altına, ayırt edilsin diye beyaz bir karta alındı.",
      "Üyelik Paneli'nin kurs gözatma bölümü artık /courses sayfasıyla AYNI bileşeni kullanıyor: aynı sekmeler/arama/Filtrele araç çubuğu, aynı Seviyeler ve Mood kartları, kurs başına aynı ders ızgarası — üst kısımdaki kişisel karşılama/Gelişim/üyelik durumu şeridi olduğu gibi kaldı, sayfanın başlangıcı header'a biraz daha yaklaştı.",
      "Üyelik Paneli'nin üst kısmı sadeleşti: Plan/Durum/Yenilenme, Gelişim özeti, Profil ayarları ve üyelik iptali artık tek satırlık, beyaz zeminli tek bir kartta — \"Profil ayarları\" ikona indi, \"Üyeliği iptal et\" en sağda kırmızı bir ikon oldu (tıklanınca satır içinde onay istiyor), \"Üyelik Paneli\"/\"Merhaba\" başlıkları mobilde küçüldü.",
      "Admin > İçerik menüsünde Moodlar artık Kurslar'ın üstünde; hem Moodlar hem Kurslar listeleri sürükle-bırak ile sıralanabiliyor, Kurslar listesinin görünümü Moodlar ile aynı satır deseninde.",
      "Admin menüsünde Yorumlar, İçerik grubundan İletişim grubuna taşındı.",
      "Admin > Raporlar'ın üç sekmesine de (Kullanıcılar/İzlenmeler/Ödemeler) ay filtresi eklendi.",
      "Düzeltme: Panel'deki \"Toplam üye\" sayısı admin hesaplarını da sayıyordu, artık yalnızca üyeleri (role: UYE) sayıyor.",
      "Panel'e de bir ay filtresi eklendi (Yeni üye/Gelir/İzlenme kartları artık seçili döneme göre) — hem Panel hem Raporlar'daki ay filtresi artık varsayılan olarak MEVCUT AYI gösteriyor (önceden \"Tüm zamanlar\"dı).",
      "Ay filtresi görsel olarak yenilendi: tarayıcının biçimlendirilemeyen tarih seçici kutusu yerine, yıl ileri/geri okları ve ay ızgarası olan kendi açılır panelimiz (aynı desen social projesindeki gibi).",
    ],
  },
  {
    surum: "3.0.0",
    tarih: "2026-08-16",
    baslik: "Kategori kavramı kaldırıldı, anasayfa yeniden tasarlandı",
    degisiklikler: [
      "Kurslar artık kategoriye bağlı değil — içerik yapısı sadeleşerek doğrudan Kurs → Ders oldu (kırıcı bir değişiklik: Kategoriler sayfası ve mevcut kategori kayıtları kaldırıldı).",
      "Kurs ekleme/düzenleme formundan \"Kategori\" seçimi kaldırıldı.",
      "Anasayfa görsel olarak yeniden tasarlandı: hero'da daha sıcak/yumuşak bir fotoğraf overlay'i, camsı outline pill butonlar, yeni bir \"eyebrow\" satırı; Hakkımda bölümüne büyük bir alıntı satırı eklendi. Sıcak toprak/kahve tonunda yeni, yalnızca anasayfaya özel bir vurgu rengi kullanılıyor.",
      "Anasayfadaki kurs listesi artık kategoriye göre gruplanmıyor, tek bir listede gösteriliyor.",
    ],
  },
  {
    surum: "2.2.0",
    tarih: "2026-08-15",
    baslik: "Yardım Menüsü, ders sıralama ve video süresi otomasyonu",
    degisiklikler: [
      "Kullanıcı menüsüne \"Yardım\" eklendi: Kullanım Kılavuzu ve bu Güncelleme Geçmişi sayfası.",
      "Kurs düzenleme sayfasında ders kartları artık sürükle-bırak ile sıralanabiliyor; elle sıra numarası girme kaldırıldı.",
      "Ders videosu yüklenirken süresi tarayıcıda otomatik algılanıp \"Süre (dk)\" alanına yazılıyor — elle girmeye gerek kalmadı.",
    ],
  },
  {
    surum: "2.1.0",
    tarih: "2026-08-15",
    baslik: "Filigran kaldırıldı, üye paneli yenilendi, Ayarlar yetkileri genişledi",
    degisiklikler: [
      "Video filigranlama tamamen kaldırıldı — bazı videoların oynatılamamasının kök nedeniydi.",
      "Üye paneli yeniden tasarlandı: giriş yapan üye artık doğrudan profil formuna değil, kurslarını ve genel ilerlemesini gösteren bir panele düşüyor; profil düzenleme ayrı bir sayfaya taşındı.",
      "Ayarlar bölümündeki 9 sayfanın (Genel Ayarlar, Sayfa Tasarımı, Kullanıcılar, Roller, Entegrasyon, Güncelleme, Cache, Yedekleme, Sistem Logları) her biri artık özel rollere tek tek verilebiliyor — eskiden ya sistem yöneticiliğine bağlıydı ya da hiç verilemiyordu.",
    ],
  },
  {
    surum: "2.0.0",
    tarih: "2026-08-13",
    baslik: "Tüm site bağlantıları İngilizce'ye çevrildi",
    degisiklikler: [
      "Herkese açık site ve admin panelindeki tüm URL yapısı Türkçe'den İngilizce'ye taşındı (kırıcı bir değişiklik — eski bağlantılar birkaç istisna dışında yönlendirilmiyor).",
    ],
  },
  {
    surum: "1.1.1",
    tarih: "2026-08-13",
    baslik: "Iyzico entegrasyon sayfası bilgilendirmesi",
    degisiklikler: [
      "Entegrasyon sayfasına, otomatik türetilen callback URL'i ve sandbox test kartı bilgisi eklendi.",
    ],
  },
  {
    surum: "1.1.0",
    tarih: "2026-08-13",
    baslik: "Manuel ödeme, parçalı video yükleme, Sayfa Tasarımı, görsel kırpma",
    degisiklikler: [
      "Video yükleme parçalı hale getirildi (bağlantı kesintisinde yalnızca o parça yeniden denenir), üst sınır 500 MB'dan 2 GB'a çıkarıldı.",
      "Yeni \"Sayfa Tasarımı\" ayar sayfası: anasayfa hero görseli, galeri ve eğitmen profili artık panelden yönetiliyor.",
      "Sitedeki her görsel yükleme noktasında (kurs/ders kapağı, hero, galeri, eğitmen portresi, üye profil fotoğrafı) sürükleyerek konumlandırma + yakınlaştırmayla kırpma eklendi.",
      "Üyelikler sayfasına \"Manuel ödeme ekle\" (banka havalesi, elden vb. Iyzico dışı ödemeler için) eklendi.",
      "Ders kartları daraltılmış özet + tıklayınca açılan düzenleme alanına dönüştürüldü; Üyeler sayfasına \"Yeni üye ekle\" eklendi.",
    ],
  },
  {
    surum: "1.0.0",
    tarih: "2026-08-07",
    baslik: "İlk sürüm",
    degisiklikler: [
      "LucidMove yoga üyelik platformu yayına alındı: Kategori → Kurs → Ders içerik yapısı, admin panel, üyelik/ödeme sistemi (Iyzico).",
      "Sayfa bazlı rol/izin sistemi, Raporlar modülü, GA4 trafik dashboard'u, yorum (testimonial) yönetimi, video izlenme takibi eklendi.",
      "Temel güvenlik sertleştirmeleri: rastgele NEXTAUTH_SECRET, open-redirect koruması, dosya imzası doğrulama, giriş/kayıt hız sınırlama.",
    ],
  },
];
