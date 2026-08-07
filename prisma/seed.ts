import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // Mevcut kursları bir kategoriye bağlamak için varsayılan "Genel" kategori —
  // admin dilerse sonradan yeni kategoriler oluşturup kursları taşıyabilir.
  const genelKategori = await db.category.upsert({
    where: { slug: "genel" },
    update: {},
    create: { ad: "Genel", slug: "genel", sira: 0 },
  });

  const kurslar = [
    {
      slug: "sabah-uyanisi",
      baslik: "Sabah Uyanışı",
      aciklama: "Güne bedeninizi ve nefesinizi uyandırarak, yumuşak bir akışla başlayın.",
      seviye: "Başlangıç",
      sira: 1,
      categoryId: genelKategori.id,
      kapakUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
      dersler: [
        { slug: "gunaydin-nefesi", baslik: "Günaydın Nefesi", sureDakika: 8, ucretsizMi: true },
        { slug: "omurga-isitma", baslik: "Omurga Isıtma", sureDakika: 12, ucretsizMi: false },
        { slug: "gune-hazirlik", baslik: "Güne Hazırlık Akışı", sureDakika: 18, ucretsizMi: false },
      ],
    },
    {
      slug: "omurga-akisi",
      baslik: "Omurga Akışı",
      aciklama: "Esneklik ve güç dengesini kuran, orta seviye bir vinyasa serisi.",
      seviye: "Orta",
      sira: 2,
      categoryId: genelKategori.id,
      kapakUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
      dersler: [
        { slug: "isinma", baslik: "Isınma ve Hizalanma", sureDakika: 10, ucretsizMi: true },
        { slug: "akis-1", baslik: "Akış Bölüm I", sureDakika: 16, ucretsizMi: false },
        { slug: "akis-2", baslik: "Akış Bölüm II", sureDakika: 16, ucretsizMi: false },
        { slug: "sogutma", baslik: "Soğutma ve Dengelenme", sureDakika: 8, ucretsizMi: false },
      ],
    },
    {
      slug: "derin-gevseme",
      baslik: "Derin Gevşeme",
      aciklama: "Yin Yoga ve nefes çalışmasıyla sinir sistemini yavaşlatan bir seans.",
      seviye: "Tüm seviyeler",
      sira: 3,
      categoryId: genelKategori.id,
      kapakUrl: "https://images.unsplash.com/photo-1545389336-cf090694435e?q=80&w=800&auto=format&fit=crop",
      dersler: [
        { slug: "giris", baslik: "Girişe Nefes", sureDakika: 6, ucretsizMi: true },
        { slug: "yin-duruslar", baslik: "Yin Duruşlar", sureDakika: 22, ucretsizMi: false },
        { slug: "kapanis", baslik: "Kapanış Meditasyonu", sureDakika: 10, ucretsizMi: false },
      ],
    },
  ];

  for (const k of kurslar) {
    const { dersler, ...kursVerisi } = k;
    const kurs = await db.course.upsert({
      where: { slug: k.slug },
      update: kursVerisi,
      create: kursVerisi,
    });

    for (const [i, d] of dersler.entries()) {
      const dersVerisi = {
        ...d,
        sira: i + 1,
        courseId: kurs.id,
        kaynakVideoUrl: "https://example.com/placeholder.mp4",
        videoUrl: "https://example.com/placeholder.mp4",
        filigranDurumu: "HAZIR" as const, // seed placeholder'ları filigran işine sokulmuyor
      };
      await db.lesson.upsert({
        where: { courseId_slug: { courseId: kurs.id, slug: d.slug } },
        update: dersVerisi,
        create: dersVerisi,
      });
    }
  }

  // Site geneli ayarlar ve eğitmen profili — admin panelinden düzenlenene kadar
  // kullanılacak varsayılan içerik. Migration sonrası site boş kalmasın diye.
  await db.siteSettings.upsert({
    where: { id: "ana" },
    update: {},
    create: {
      id: "ana",
      siteBasligi: "LucidMove — Evinizde, kendi hızınızda yoga",
      siteAciklamasi:
        "Aylık veya yıllık üyelikle sınırsız yoga videosuna erişin. Başlangıçtan ileri seviyeye, tek eğitmenle bütünlüklü bir pratik.",
      heroEyebrow: "Tek eğitmen · sınırsız pratik",
      heroBaslik: "Nefesinizin *hızında* bir yoga pratiği.",
      heroAltBaslik:
        "Stüdyoya gitmeden, kendi salonunuzda; başlangıçtan ileri seviyeye haftalık yeni derslerle büyüyen bir video kütüphanesi.",
      heroCtaBirincil: "Üyeliği başlat",
      heroCtaIkincil: "Kursları incele",
      uyelikEyebrow: "Üyelik",
      uyelikBaslik: "Bir plan seçin, istediğiniz an bırakın.",
      uyelikAltBaslik: "Tüm planlar kütüphanenin tamamına erişim içerir. Gizli ücret yok.",
      iletisimEmail: "merhaba@lucidmove.net",
      calismaSaatleri: "Pazartesi–Cuma, 09:00–18:00",
      instagramUrl: "https://www.instagram.com/idilyogamove/",
      footerTagline: "Evinizin sessizliğinde, kendi hızınızda bir yoga pratiği.",
    },
  });

  await db.instructorProfile.upsert({
    where: { id: "ana" },
    update: {},
    create: {
      id: "ana",
      ad: "İdil Ece Bal",
      bio: [
        "On yılı aşkın süredir yoga öğretiyorum. Yolculuğum, uzun süren bir masa başı dönemim sonrasında bedenimle yeniden tanışma ihtiyacından başladı — bugün aynı ihtiyacı sizinle paylaşan binlerce kişiye rehberlik ediyorum.",
        "200 saatlik Hatha Yoga öğretmenlik sertifikamın ardından Vinyasa ve Yin Yoga alanlarında uzmanlaştım. Derslerimde hız değil, doğru hizalanma ve nefesle uyum önceliğim.",
        "LucidMove, stüdyoda yıllardır anlattığım o sakin, sabırlı sesi evinize taşımak için var oldu. Her video tek çekim; kusurlu anlar dahil, çünkü gerçek bir pratik zaten böyle.",
      ].join("\n\n"),
      sertifikalar: ["200 saat Hatha Yoga Öğretmenliği", "Yin Yoga Uzmanlık Eğitimi", "Vinyasa Akış Sertifikası"].join(
        "\n"
      ),
      yaklasim: [
        "Nefes önce, hareket sonra",
        "Her seviyeye uyarlanabilir duruşlar",
        "Sabit, sakin, tekrar edilebilir ritim",
      ].join("\n"),
      portreUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=900&auto=format&fit=crop",
      hakkimdaTeaserOzet: "10 yıldır aynı soruyu soruyorum: bugün bedenine nasıl bakacaksın?",
    },
  });

  // Fiyat planları — checkout DB'den bu satırları okuyor, bu yüzden migration ile
  // aynı deploy'da seed edilmeleri zorunlu (aksi halde checkout 500 döner).
  await db.pricingPlan.upsert({
    where: { plan: "AYLIK" },
    update: {},
    create: {
      plan: "AYLIK",
      baslik: "Aylık",
      fiyat: process.env.AYLIK_UCRET || "299.90",
      periyot: "/ay",
      aciklama: "Esnek, istediğiniz an iptal edin.",
      ozellikler: ["Tüm video kütüphanesine erişim", "Haftalık yeni dersler", "Her cihazdan izleme"].join("\n"),
      rozet: null,
      vurgulu: false,
      sira: 1,
    },
  });

  await db.pricingPlan.upsert({
    where: { plan: "YILLIK" },
    update: {},
    create: {
      plan: "YILLIK",
      baslik: "Yıllık",
      fiyat: process.env.YILLIK_UCRET || "2399.90",
      periyot: "/yıl",
      aciklama: "Aylığa göre 2 ay hediye.",
      ozellikler: [
        "Tüm video kütüphanesine erişim",
        "Haftalık yeni dersler",
        "Her cihazdan izleme",
        "İndirilebilir pratik takvimi",
      ].join("\n"),
      rozet: "2 ay hediye",
      vurgulu: true,
      sira: 2,
    },
  });

  // Yerel geliştirme için bilinen şifreli demo hesaplar — prod'da asla çalışmaz.
  if (process.env.NODE_ENV !== "production") {
    const adminSifreHash = await bcrypt.hash("admin1234", 12);
    await db.user.upsert({
      where: { email: "admin@lucidmove.net" },
      update: { role: "ADMIN", sistemYoneticisiMi: true },
      create: {
        ad: "Admin",
        email: "admin@lucidmove.net",
        passwordHash: adminSifreHash,
        role: "ADMIN",
        // Ayarlar (Kullanıcılar/Roller/Cache/Yedekleme/Sistem Logları) bölümüne
        // erişebilen tek hesap — bkz. lib/admin-auth.ts.
        sistemYoneticisiMi: true,
      },
    });
    console.log("Dev admin hazır — admin@lucidmove.net / admin1234");

    // Aktif aylık üyeliği olan demo bir üye — hesabım sayfasını dolu haliyle
    // test edebilmek için.
    const uyeSifreHash = await bcrypt.hash("uye12345", 12);
    const demoUye = await db.user.upsert({
      where: { email: "uye@lucidmove.net" },
      update: {},
      create: {
        ad: "Demo Üye",
        email: "uye@lucidmove.net",
        passwordHash: uyeSifreHash,
        role: "UYE",
      },
    });

    const donemSonu = new Date();
    donemSonu.setMonth(donemSonu.getMonth() + 1);

    const mevcutAbonelik = await db.subscription.findFirst({
      where: { userId: demoUye.id, status: "AKTIF" },
    });
    const demoAbonelik =
      mevcutAbonelik ??
      (await db.subscription.create({
        data: {
          userId: demoUye.id,
          plan: "AYLIK",
          status: "AKTIF",
          currentPeriodEnd: donemSonu,
        },
      }));

    const mevcutOdeme = await db.payment.findFirst({ where: { subscriptionId: demoAbonelik.id } });
    if (!mevcutOdeme) {
      await db.payment.create({
        data: {
          userId: demoUye.id,
          subscriptionId: demoAbonelik.id,
          tutar: process.env.AYLIK_UCRET || "299.90",
          durum: "BASARILI",
        },
      });
    }

    console.log("Dev demo üye hazır — uye@lucidmove.net / uye12345 (aktif aylık üyelik)");
  }

  console.log("Örnek veriler eklendi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
