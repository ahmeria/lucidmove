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
};

export default nextConfig;
