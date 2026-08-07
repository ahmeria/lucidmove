// Sayfa başlığı artık üstteki sabit header'da gösteriliyor (bkz.
// app/admin/AdminHeader.tsx > aktifSayfaBasligi) — burada tekrar etmiyoruz.
// Bu bileşen yalnızca sayfaya özel bir aksiyon (buton, Ayarlar sekme şeridi
// vb.) varsa, ince ve sağa yaslı tek bir şerit olarak gösterir.
export default function SayfaBasligi({ sag }: { sag: React.ReactNode }) {
  return <div className="flex justify-end mb-6">{sag}</div>;
}
