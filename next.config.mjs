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
  // sayfadaki bölümler) — eski bağlantılar kırılmasın diye ilgili çapalara
  // yönlendiriyoruz. Not: /kurslar/:slug (kurs detayı) bundan etkilenmez.
  async redirects() {
    return [
      { source: "/kurslar", destination: "/#kurslar", permanent: false },
      { source: "/hakkimda", destination: "/#hakkimda", permanent: false },
      { source: "/uyelik", destination: "/#uyelik", permanent: false },
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
