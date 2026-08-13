/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // iyzipay, kaynak dosyalarını çalışma zamanında __dirname üzerinden okuyor;
  // Next'in build-time dosya izlemesi bunu kopyalamayınca "ENOENT resources"
  // hatası veriyor. Paketi bundle'lamadan native require ile çalıştırıyoruz.
  experimental: {
    serverComponentsExternalPackages: ["iyzipay"],
  },
  // Site tek sayfaya indirildi (/kurslar, /hakkimda, /uyelik artık ana
  // sayfadaki bölümler) — eski (Türkçe) bağlantılar kırılmasın diye ilgili
  // çapalara yönlendiriyoruz. Kaynak yollar BİLEREK Türkçe bırakıldı — bunlar
  // gerçek sayfalar değil, geçmişte paylaşılmış/işaretlenmiş dış bağlantılar
  // için tarihsel bir köprü; route'ların İngilizce'ye taşınması bu girdileri
  // etkilemiyor. Not: /courses/:slug (kurs detayı) bundan etkilenmez.
  async redirects() {
    return [
      { source: "/kurslar", destination: "/#courses", permanent: false },
      { source: "/hakkimda", destination: "/#about", permanent: false },
      { source: "/uyelik", destination: "/#membership", permanent: false },
    ];
  },
  // Temel güvenlik başlıkları — tüm route'lara uygulanır. Not: kapsamlı bir
  // Content-Security-Policy bilinçli olarak eklenmedi; Iyzico'nun Checkout
  // Form gömme akışı (bkz. components/FiyatPlanlari.tsx) kendi script/iframe
  // kaynaklarını kullanıyor ve doğru domain listesi test edilmeden eklenen
  // sıkı bir CSP ödeme akışını sessizce kırabilir.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
