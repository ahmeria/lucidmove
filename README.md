# LucidMove — Üyelikli Yoga Video Platformu

Next.js 14 (App Router, TypeScript), Prisma + MySQL, NextAuth ve Iyzico
ile kurulmuş, tek eğitmenli, aylık/yıllık üyelikli bir yoga video platformu.

## İçerik

- **Anasayfa** — modern, "nefes çemberi" imzalı tanıtım sayfası
- **Kurslar** — kurs/video listesi, üyelere özel içerik kilidi (her kursta 1 ücretsiz tanıtım dersi)
- **Üyelik** — aylık/yıllık plan seçimi, Iyzico ile ödeme
- **Hakkımda** — eğitmen tanıtım sayfası
- **İletişim** — iletişim formu
- **Kayıt / Giriş** — e-posta + şifre ile üyelik sistemi (NextAuth)
- **Admin paneli** (`/admin`) — kurs/ders, fiyatlandırma, site metinleri,
  iletişim mesajları ve üyelikler tek yerden yönetilir (bkz. bölüm 7)
- Prisma ile MySQL veritabanı bağlantısı (cPanel uyumlu)

## 1. Gereksinimler

- Node.js 18.18 veya üzeri
- Bir MySQL/MariaDB veritabanı — bu proje **cPanel'in MySQL Databases**
  aracıyla oluşturduğunuz veritabanını kullanacak şekilde ayarlandı (bkz.
  bölüm 2.1). PostgreSQL kullanmak isterseniz `prisma/schema.prisma`
  içindeki `provider = "mysql"` satırını `"postgresql"` yapıp
  `DATABASE_URL`'i buna göre güncellemeniz yeterli.
- Bir [Iyzico](https://www.iyzico.com) satıcı hesabı — test için sandbox
  hesabı yeterli: https://sandbox-merchant.iyzipay.com

## 2. Kurulum

### 2.1 cPanel'de veritabanı bilgilerini bulma

1. cPanel'de **MySQL Databases** sayfasını açın.
2. Daha önce oluşturduğunuz veritabanının tam adını not edin — cPanel bunu
   otomatik olarak `kullaniciadi_veritabaniadi` şeklinde önekler (ör.
   `lucidcpanel_lucidmove`).
3. Aynı sayfada bu veritabanına **ALL PRIVILEGES** yetkisiyle atanmış bir
   MySQL kullanıcısı olduğundan emin olun (yoksa "Add User to Database"
   ile oluşturun). Kullanıcı adı da aynı şekilde önekli olur (ör.
   `lucidcpanel_dbuser`).
4. Şifreyi hatırlamıyorsanız kullanıcının şifresini oradan sıfırlayabilirsiniz.
5. cPanel yerel makinenizde çalıştığı için host genelde `localhost`,
   port ise `3306` olur (cPanel arayüzünde farklı belirtilmediyse).

Bu bilgilerle `.env` dosyanızdaki `DATABASE_URL` şu şekilde olur:

```
DATABASE_URL="mysql://lucidcpanel_dbuser:SIFRENIZ@localhost:3306/lucidcpanel_lucidmove"
```

> Türkçe karakterlerin (ş, ç, ğ, ı, ö, ü) doğru saklanması için cPanel'de
> veritabanını oluştururken (ya da phpMyAdmin > Operations sekmesinden)
> karakter setini **utf8mb4** olarak ayarlamanızı öneririz.

### 2.2 Bağımlılıkları kurma ve tabloları oluşturma

```bash
# Bağımlılıkları yükleyin
npm install

# .env dosyanızı oluşturun
cp .env.example .env
# .env içindeki DATABASE_URL, NEXTAUTH_SECRET, IYZICO_* değerlerini doldurun

# Veritabanı tablolarını oluşturun
npx prisma migrate dev --name baslangic

# Örnek kurs/ders verilerini ekleyin (opsiyonel ama önerilir)
npx prisma db seed

# Geliştirme sunucusunu başlatın
npm run dev
```

Varsayılan olarak `npm run dev` ile site http://localhost:3000 adresinde
açılır. Aşağıdaki bölüm, siteyi **http://lucidmove.local** adresinden
açmak ve veritabanı olarak cPanel sunucunuzdaki MySQL'e **uzaktan**
bağlanmak için XAMPP kullanımını anlatır.

> Not: cPanel'iniz Node.js barındırmayı desteklemediği için (destek
> ekibinin belirttiği gibi), bu kurulum şu an için **yalnızca yerel
> geliştirme** amaçlıdır — siteyi gerçek ziyaretçilere açmak için ayrıca
> bir barındırma çözümü (ör. Vercel) gerekecek. O adımı, veritabanı ve
> yerel ortam oturunca birlikte planlarız.

## 3. Yerel kurulum — XAMPP ile lucidmove.local (uzak MySQL)

### 3.1 cPanel'de uzaktan erişime izin verme

1. cPanel'de **Remote MySQL** sayfasını açın.
2. Şu an kullandığınız bilgisayarın genel (public) IP adresini öğrenin —
   tarayıcıda "what is my ip" yazıp arayabilirsiniz.
3. Bu IP'yi **Access Host** olarak ekleyin. (Ev/ofis interneti IP'niz
   zaman zaman değişiyorsa, bağlantı koptuğunda buraya güncel IP'yi
   tekrar eklemeniz gerekebilir.)
4. **MySQL Databases** sayfasından veritabanı adını, kullanıcı adını ve
   sunucunun genel IP'sini/hostname'ini not edin (host bilginizi cPanel'in
   ana ekranındaki "Genel Bilgiler / General Information" bölümünde
   bulabilirsiniz).

### 3.2 XAMPP'te lucidmove.local adresini kurma

XAMPP'in Apache'i burada yalnızca bir **yönlendirici (reverse proxy)**
görevi görecek — asıl uygulamayı hâlâ `npm run dev` çalıştırır, XAMPP
sadece `lucidmove.local` isteklerini o sunucuya iletir.

1. **hosts dosyasına ekleyin** — Not Defter'i **yönetici olarak** açıp
   `C:\Windows\System32\drivers\etc\hosts` dosyasının sonuna şunu ekleyin:
   ```
   127.0.0.1  lucidmove.local
   ```
2. **Apache modüllerini açın** — `C:\xampp\apache\conf\httpd.conf`
   dosyasını açın, şu iki satırın başındaki `#` işaretini kaldırın (yoksa
   ekleyin):
   ```
   LoadModule proxy_module modules/mod_proxy.so
   LoadModule proxy_http_module modules/mod_proxy_http.so
   ```
3. **Sanal host tanımlayın** —
   `C:\xampp\apache\conf\extra\httpd-vhosts.conf` dosyasının sonuna
   ekleyin:
   ```apache
   <VirtualHost *:80>
       ServerName lucidmove.local
       ProxyPreserveHost On
       ProxyPass / http://127.0.0.1:3000/
       ProxyPassReverse / http://127.0.0.1:3000/
   </VirtualHost>
   ```
4. XAMPP Control Panel'den **Apache**'yi durdurup tekrar başlatın.

> Apache zaten 80 portunu dinlediği için, `npm run dev` her zamanki gibi
> 3000 portunda kalır — sadece tarayıcıda artık `lucidmove.local` yazmanız
> yeterli, Apache isteği arkada 3000'e iletir.

### 3.3 Bağlanma ve çalıştırma

`.env` dosyanızı açıp `DATABASE_URL`'i gerçek bilgilerinizle doldurun:

```
DATABASE_URL="mysql://cpaneluser_dbuser:SIFRENIZ@SUNUCUNUZUN_IP_ADRESI:3306/cpaneluser_lucidmove"
NEXTAUTH_URL="http://lucidmove.local"
```

Sonra:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Artık http://lucidmove.local adresinden siteye ulaşabilirsiniz.

**Sorun giderme:** `prisma migrate deploy` bağlantı hatası verirse en
sık sebep, Remote MySQL'e eklediğiniz IP'nin güncel olmamasıdır — IP'niz
değiştiyse cPanel'deki Access Host listesini güncelleyin.

## 4. Iyzico entegrasyonu nasıl çalışır?

- `/uyelik` sayfasında kullanıcı bir plan seçtiğinde, `/api/uyelik/checkout`
  route'u Iyzico'nun **Checkout Form** akışını başlatır (`lib/iyzico.ts`).
  Kart bilgileri hiçbir zaman bizim sunucumuza gelmez — kullanıcı Iyzico'nun
  güvenli formunu doldurur.
- Ödeme sonucu `/api/uyelik/webhook` adresine POST edilir; bu route sonucu
  Iyzico'dan tekrar sorgulayıp doğrular ve veritabanındaki `Subscription`
  kaydını `AKTIF` yapar.
- `NEXTAUTH_URL` değerinin gerçek alan adınızla eşleşmesi önemlidir, çünkü
  callback URL bu değerden türetilir.

**Şu an sandbox (test) modundasınız.** Site canlıda çalışır ama gerçek
kart bilgisiyle ödeme alamaz — bu, ziyaretçilere görünmez, sadece Iyzico'nun
test ortamına bağlanır. Gerçek ödeme almaya hazır olduğunuzda:

1. Iyzico'da işletme evraklarınızla **canlı hesap başvurusu** yapın
   (sandbox hesabından farklıdır): https://www.iyzico.com
2. Onaylandığında Iyzico panelinden **canlı API anahtarlarını** alın.
3. Ortam değişkenlerini güncelleyin:
   ```
   IYZICO_API_KEY="canlı-anahtarınız"
   IYZICO_SECRET_KEY="canlı-gizli-anahtarınız"
   IYZICO_BASE_URL="https://api.iyzipay.com"
   ```
   (Sandbox'takinden farkı: `sandbox-api` değil `api`.)
4. cPanel'de "Setup Node.js App" üzerinden uygulamayı **Restart** edin.
5. Küçük bir test ödemesi yaparak akışı doğrulayın.

## 5. Video ekleme ve barındırma hakkında not

Admin panelde (kurs tanıtım videosu ve ders videoları) her video alanı iki
seçenek sunar:

- **YouTube linki** — video, sayfada gömülü YouTube oynatıcısıyla gösterilir.
- **Dosya yükle** — video dosyası (`mp4`/`webm`/`ogg`/`mov`, en fazla 500 MB)
  `app/api/admin/upload/route.ts` üzerinden sunucudaki `public/uploads/videos/`
  klasörüne kaydedilir ve doğrudan Next.js tarafından servis edilir.

Hangi tür olduğu (`lib/video.ts`) URL'e bakılarak otomatik anlaşılır — ayrı bir
alan tutulmaz. Bölüm 3'teki XAMPP/Apache reverse-proxy kurulumunu
kullanıyorsanız, büyük dosya yüklemelerinde Apache'nin varsayılan istek boyutu
sınırına takılabilirsiniz; gerekirse `httpd.conf`'a `LimitRequestBody 0`
ekleyin.

Yerel dosya yükleme, sunucunun diskini ve bant genişliğini doğrudan kullanır
— indirmeye/paylaşılmaya karşı koruma (imzalı/süresi dolan URL) veya video
optimizasyonu (transcoding, adaptif bitrate) sağlamaz. Büyük ölçekli veya
korumalı bir kütüphane için [Mux](https://mux.com),
[Cloudflare Stream](https://developers.cloudflare.com/stream/) veya
[Bunny Stream](https://bunny.net/stream/) gibi bir servisin verdiği
oynatma URL'ini video alanına YouTube linki gibi yapıştırabilirsiniz (bu
servislerin embed URL'leri de `videoUrl`/`tanitimVideoUrl` alanına
yazılabilir; `lib/video.ts`'teki YouTube algılaması eşleşmezse dosya doğrudan
`<video>` etiketiyle oynatılmaya çalışılır — bu servisler için ayrı bir embed
algılaması eklemek isterseniz `isYoutubeUrl`'e benzer bir kontrol ekleyin).

## 6. Veritabanı şeması

`prisma/schema.prisma` içinde:

- `User` — üyeler (`role` alanı `UYE`/`ADMIN` — admin panel erişimini belirler)
- `Subscription` — aylık/yıllık abonelik kaydı ve durumu
- `Payment` — her ödeme denemesinin kaydı
- `Course` / `Lesson` — kurslar ve dersler
- `LessonProgress` — kullanıcının izleme ilerlemesi (altyapı hazır, arayüzde
  henüz gösterilmiyor — isterseniz ekleyebiliriz)
- `SiteSettings` / `InstructorProfile` — tekil satırlar; ana sayfa/hakkımda/
  iletişim metinleri ve eğitmen bilgisi (admin panelden düzenlenir)
- `PricingPlan` — aylık/yıllık fiyat, açıklama, özellik listesi (admin panelden
  düzenlenir; checkout tutarı buradan okunur)
- `ContactMessage` — iletişim formundan gelen mesajlar (admin panelden görülür)

Şemayı değiştirdikten sonra:

```bash
npx prisma migrate dev --name aciklama
```

## 7. Admin paneli

Site içeriğinin tamamı (`/admin` altında) bir yönetim panelinden düzenlenir:

- **Panel** (`/admin`) — üye/abonelik/gelir/mesaj özeti
- **Kurslar** (`/admin/kurslar`) — kurs ve ders ekleme, düzenleme, silme
- **Fiyatlandırma** (`/admin/fiyatlandirma`) — aylık/yıllık plan fiyat ve içeriği
- **Genel Ayarlar** (`/admin/ayarlar`) — hero metni, üyelik sayfası metinleri,
  iletişim bilgisi, eğitmen biyografisi/sertifikaları, SEO başlığı
- **Mesajlar** (`/admin/mesajlar`) — iletişim formundan gelen mesajlar
- **Üyelikler** (`/admin/uyelikler`) — tüm aboneliklerin durumu, admin iptali

### İlk admin hesabını oluşturma

- **Yerel geliştirme:** `npx prisma db seed` çalıştığında (production dışı
  ortamlarda) otomatik olarak bir admin hesabı oluşturulur:
  `admin@lucidmove.net` / `admin1234`. Sadece geliştirme için kullanın.
- **Prod / mevcut bir kullanıcıyı admin yapmak:**
  ```bash
  npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/make-admin.ts eposta@ornek.com
  ```
  Bu, admin panelde kendi kendine "admin yap" özelliği olmamasının nedenidir —
  ilk admin'i oluşturmanın tek yolu bu script veya doğrudan veritabanı.

### Yetki kontrolü nasıl çalışıyor?

`middleware.ts`, oturum jetonundaki (JWT) `role` alanına bakarak `/admin/*`
isteklerini hızlıca filtreler — ama bu sadece bir ön-filtre. Asıl yetki
kontrolü her admin sayfası (`app/admin/layout.tsx`) ve her `/api/admin/**`
route'unda veritabanından **canlı** okunur (`lib/admin-auth.ts`), böylece bir
kullanıcının admin yetkisi geri alındığında eski oturum jetonu bir süre daha
geçerli olsa bile erişim anında kapanır.

## 8. Sırada ne var?

Bu iskelet çalışan bir temel sunar; canlıya almadan önce şunları da
düşünebilirsiniz:

- **Otomatik yenileme:** Şu an her ödeme, Iyzico'nun tek seferlik "Checkout
  Form" akışıyla alınıyor — dönem bitince otomatik tekrar tahsilat yapılmıyor.
  Gerçek bir otomatik-yenilemeli abonelik için Iyzico'nun ayrı **Abonelik
  (Subscription) API**'sine geçmeniz gerekir. Şimdilik `/hesabim` sayfasından
  kullanıcılar üyeliklerini görüntüleyip iptal edebiliyor.
- Şifre sıfırlama akışı (e-posta ile)
- Fatura/e-posta bildirimleri (Resend, Postmark vb.)
- Admin panelden görsel **dosya yükleme** (şu an tüm görseller URL olarak
  yapıştırılıyor — Unsplash veya kendi barındırdığınız bir görsel adresi)
- SEO için `sitemap.xml` ve `robots.txt`
