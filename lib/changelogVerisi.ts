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
