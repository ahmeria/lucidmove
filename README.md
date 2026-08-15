# LucidMove — Üyelikli Yoga Video Platformu

Next.js 14 (App Router, TypeScript), Prisma + MariaDB, NextAuth ve Iyzico
ile kurulmuş, tek eğitmenli, aylık/yıllık üyelikli bir yoga video platformu.

## İçerik

- **Anasayfa** — modern, "nefes çemberi" imzalı tanıtım sayfası
- **Kurslar** — kurs/video listesi, üyelere özel içerik kilidi (her kursta 1 ücretsiz tanıtım dersi)
- **Üyelik** — aylık/yıllık plan seçimi, Iyzico ile ödeme
- **Hakkımda** — eğitmen tanıtım sayfası
- **İletişim** — iletişim formu
- **Kayıt / Giriş** — e-posta + şifre ile üyelik sistemi (NextAuth)
- **Admin paneli** (`/admin`) — kurs/ders, fiyatlandırma, site metinleri,
  iletişim mesajları ve üyelikler tek yerden yönetilir (bkz. bölüm 8)
- Prisma ile MariaDB veritabanı bağlantısı (cPanel uyumlu)

## 1. Gereksinimler

- Node.js 18.18 veya üzeri
- Bir **MariaDB** veritabanı — bu proje **cPanel'in MySQL Databases**
  aracıyla oluşturduğunuz veritabanını kullanacak şekilde ayarlandı (bkz.
  bölüm 2.1). cPanel arayüzü tarihsel nedenlerle hâlâ "MySQL Databases" /
  "Remote MySQL" yazsa da, altyapı gerçekte **MariaDB**'dir — Prisma
  tarafında bu bir fark yaratmaz, `provider = "mysql"` MariaDB'ye karşı da
  (aynı bağlantı protokolünü konuştuğu için) sorunsuz çalışır; bunu
  `"mariadb"` gibi bir değere değiştirmeyin, öyle bir Prisma provider'ı
  yoktur. Asıl önemli olan, sunucuda **paket kurarken** bunu bilmek — bkz.
  bölüm 4, adım 4'teki uyarı: MariaDB kuruluyken `mysql-server`/`mysql-client`
  paketini kurmaya çalışmak, apt'ın paket çakışmasını mevcut MariaDB
  kurulumunu kaldırarak çözmesine (ve veritabanının çökmesine) yol açabilir.
  PostgreSQL kullanmak isterseniz `prisma/schema.prisma` içindeki
  `provider = "mysql"` satırını `"postgresql"` yapıp `DATABASE_URL`'i buna
  göre güncellemeniz yeterli.
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
açmak ve veritabanı olarak cPanel sunucunuzdaki MariaDB'ye **uzaktan**
bağlanmak için XAMPP kullanımını anlatır.

> Not: cPanel'iniz Node.js barındırmayı desteklemediği için (destek
> ekibinin belirttiği gibi), bu kurulum şu an için **yalnızca yerel
> geliştirme** amaçlıdır — siteyi gerçek ziyaretçilere açmak için ayrıca
> bir barındırma çözümü (ör. Vercel) gerekecek. O adımı, veritabanı ve
> yerel ortam oturunca birlikte planlarız.

## 3. Yerel kurulum — XAMPP ile lucidmove.local (uzak MariaDB)

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

## 4. Sunucuya kurulum (prodüksiyon)

Bölüm 2-3 yerel geliştirme/test içindi; gerçek ziyaretçilere açık bir
sunucuda (VPS, cPanel'in Node.js desteği, vb.) çalıştırmak için aşağıdaki
adımları izleyin. Bu projede kurulum sihirbazı yok — veritabanı
migration'ları ve ilk admin hesabı elle (8. adımda) oluşturulur.

**1. SSH ile sunucuya bağlan**

```bash
ssh kullanici_adi@sunucu_ip_veya_domain
```

Sunucu sağlayıcınızdan aldığınız kullanıcı adı ve şifre/SSH key ile bağlanın.
Aşağıdaki tüm adımlar bu SSH oturumunda, sunucu üzerinde çalıştırılır.

**2. GitHub'dan kodu çek**

Repo private olduğu için sunucunun GitHub'dan çekebilmesi bir kimlik
doğrulama yöntemi ister. **Deploy Key (SSH) önerilir** — sunucuya bu repoyu
sadece salt-okunur çekme izni verir, kişisel GitHub hesabınızın
şifresi/token'ı sunucuda saklanmaz.

*Yöntem A — SSH Deploy Key (önerilen)*

1. Sunucuda bu deploy için ayrı bir SSH key üretin (parola sormaması için
   `-N ""` ile boş bırakıyoruz):
   ```bash
   ssh-keygen -t ed25519 -C "lucidmove-server" -f ~/.ssh/lucidmove_deploy -N ""
   ```
2. Public key'i ekrana basıp tamamını kopyalayın:
   ```bash
   cat ~/.ssh/lucidmove_deploy.pub
   ```
3. GitHub'da `https://github.com/ahmeria/lucidmove/settings/keys` →
   **"Add deploy key"** → bir başlık verin (ör. "Prod sunucu"), kopyaladığınız
   public key'i yapıştırın → **"Allow write access" kutusunu işaretlemeyin**
   (çekmek için salt-okunur yeterli) → **"Add key"**.
4. Sunucuda `~/.ssh/config` dosyasına bu key'i GitHub bağlantısında
   kullanacak bir takma ad (host alias) ekleyin:
   ```bash
   cat >> ~/.ssh/config << 'EOF'

   Host github.com-lucidmove
       HostName github.com
       User git
       IdentityFile ~/.ssh/lucidmove_deploy
       IdentitiesOnly yes
   EOF
   chmod 600 ~/.ssh/config
   ```
5. Bağlantıyı test edin (ilk seferinde "Are you sure you want to continue
   connecting?" sorusuna `yes` deyin):
   ```bash
   ssh -T git@github.com-lucidmove
   ```
   `Hi ahmeria/lucidmove! You've successfully authenticated...` mesajını
   görmelisiniz.
6. Repoyu çekin — **`public_html` içine değil**, ondan tamamen ayrı bir
   klasöre (Next.js, PHP siteleri gibi dosyaları doğrudan disk'ten servis
   etmez; her istek 7. adımda kuracağınız reverse proxy ile Node
   process'ine yönlenir — kod nerede durduğu domain'e bağlı değildir, ayrıca
   `.env` içindeki veritabanı şifresi/`NEXTAUTH_SECRET` gibi bilgilerin web
   kökünün dışında kalması ekstra güvenlik sağlar):
   ```bash
   mkdir -p ~/apps
   cd ~/apps
   git clone github.com-lucidmove:ahmeria/lucidmove.git lucidmove
   cd lucidmove
   ```

*Yöntem B — HTTPS + Personal Access Token (daha basit, SSH key kurmak istemiyorsanız)*

1. `https://github.com/settings/tokens` → "Generate new token (classic)" →
   sadece `repo` kapsamını seçin, süresini belirleyin, oluşturun, token'ı
   kopyalayın (bir daha gösterilmez).
2. Sunucuda:
   ```bash
   git clone https://github.com/ahmeria/lucidmove.git lucidmove
   cd lucidmove
   ```
   Kullanıcı adı sorduğunda GitHub kullanıcı adınızı, şifre sorduğunda az
   önce oluşturduğunuz token'ı yapıştırın.

> Bu, ilk kurulum için tek seferlik `clone`. Sonraki güncellemeler için
> 9. adımın sonundaki panel-içi güncelleme notuna bakın.

**3. Node.js kur (sunucuda yoksa)**

Next.js 14, Node.js **>= 18.18** ister. Debian/Ubuntu için:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

(sudo yetkiniz yoksa `nvm` alternatifi de kullanılabilir.)

**4. mysqldump'ı kur (opsiyonel ama önerilir)**

Admin panel > Ayarlar > Yedekleme'den veritabanı yedeği alma özelliği bu
komut satırı aracına bağımlı — yoksa sessizce atlanmaz, ilgili işlem hata
verir.

> ⚠️ **Önce kontrol edin, hemen kurmayın.** Sunucuda zaten MariaDB
> kuruluysa (cPanel'li sunucularda ve çoğu Debian/Ubuntu kurulumunda
> varsayılan budur), `mysqldump` komutu muhtemelen **zaten mevcuttur** —
> MariaDB'nin kendi paketiyle birlikte gelir. Önce şunu çalıştırın:
> ```bash
> which mysqldump || which mariadb-dump
> ```
> Bir çıktı görüyorsanız hiçbir şey kurmanıza gerek yok, alttaki adımı
> atlayın. **`mysql-client` paketini asla körlemesine kurmayın** — bazı
> repo yapılandırmalarında bu, apt'ın paket çakışmasını çözmek için
> mevcut **`mariadb-server`'ı kaldırmasına** (ve veritabanınızın çökmesine)
> yol açabilir. Gerçekten eksikse, MariaDB'nin kendi istemci paketini kurun:
> ```bash
> sudo apt-get install -y mariadb-client
> ```

```bash
which mysqldump || which mariadb-dump
```

PATH'te değilse (ör. cPanel gibi paylaşımlı ortamlarda), `.env`
dosyasındaki `MYSQLDUMP_PATH` değişkenine tam ikili dosya yolunu
yazabilirsiniz.

**5. `.env` dosyasını hazırla**

```bash
cd ~/apps/lucidmove   # az önce klonladığınız klasör
cp .env.example .env
```

En azından şu değerleri doldurun:

- `DATABASE_URL` — cPanel/MariaDB sunucunuzun gerçek bağlantı bilgileri
  (bkz. bölüm 2.1)
- `NEXTAUTH_SECRET` — `openssl rand -base64 32` ile üretin
- `NEXTAUTH_URL` — sitenin gerçek adresi, ör. `https://lucidmove.net`
- `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` / `IYZICO_BASE_URL` — canlıya
  geçtiğinizde gerçek anahtarlarla (bkz. bölüm 5)

**6. Bağımlılıkları yükle, tabloları oluştur ve derle — bu sırayı bozmayın**

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

> **Önemli:** `npm install` her zaman en başta ve `.env`/paket güncellemesi
> içeren her yeni deploy'da tekrar çalıştırılmalı. `node_modules`
> eksik/eskiyse `npx prisma generate` gibi komutlar paketin **local sürümü
> yerine npm'deki en güncel major sürümü** indirip çalıştırabilir (bu proje
> Prisma `^5.x` kullanıyor; `node_modules` eksikken çalıştırılan
> `npx prisma generate` gerçekte Prisma 7'yi çekip şema uyumsuzluğu hatası
> verebilir). `npm start`'tan önce mutlaka `npm run build` çalışmış olmalı
> (`.next/` klasörü repoya girmez, her deploy'da sunucuda yeniden üretilmesi
> gerekir).

Bu adımın sonunda `npm start` terminalde ayakta kalıp `Ready` benzeri bir
satır basar ve **3000 portunda** dinler (bkz. `package.json` içindeki
`start` script'i). Doğrulamak için aynı sunucuda başka bir terminalde:

```bash
curl -I http://127.0.0.1:3000
```

`HTTP/1.1 200` dönmelidir. Bu adım başarısızsa 7. adıma geçmeden önce
burayı çözün.

> `public/uploads/` klasörü (kapak görselleri, ders videoları) uygulama
> tarafından ilk yüklemede otomatik oluşturulur — sadece process'i
> çalıştıran kullanıcının proje klasörüne yazma izni olduğundan emin olun.
> Bu klasör `npm run build`'den etkilenmez, deploy'lar arasında korunur.

**7. Ters proxy (reverse proxy) kur — Apache/Nginx**

`npm start` uygulamayı sadece `127.0.0.1:3000`'de dinletir; tarayıcı ise
domain'e `80`/`443` portundan gider. Bu ikisini birbirine bağlayan bir
reverse proxy kurulmadan siteye girmeye çalışırsanız, web sunucusu
(Apache/Nginx) domain'in doküman kökünde sunulabilir bir dosya bulamaz ve
genelde **403 Forbidden** döner — bu adım atlanınca en sık karşılaşılan
hata budur.

Sunucuda hangisi kuruluysa (`sudo systemctl status nginx` veya
`sudo systemctl status apache2` ile kontrol edin) ona göre devam edin:

*Nginx:*

```nginx
# /etc/nginx/sites-available/lucidmove.net
server {
    listen 80;
    server_name lucidmove.net;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 500M;  # ders videosu yüklemeleri için (bkz. bölüm 6)
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lucidmove.net /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

*Apache:*

```bash
sudo a2enmod proxy proxy_http
```

```apache
# /etc/apache2/sites-available/lucidmove.net.conf
<VirtualHost *:80>
    ServerName lucidmove.net
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    LimitRequestBody 0
</VirtualHost>
```

```bash
sudo a2ensite lucidmove.net.conf
sudo systemctl reload apache2
```

> Bu vhost/site config'inden önce domain için zaten bir `DocumentRoot`
> tanımı varsa ve içinde `Require all denied` / `Options -Indexes` gibi bir
> kısıtlama duruyorsa, 403'ün asıl kaynağı o olabilir — proxy config'ini
> etkinleştirdikten sonra eski `DocumentRoot`/`<Directory>` bloğunu kaldırın
> ya da devre dışı bırakın.
>
> HTTPS için config'i kurduktan sonra
> `sudo apt install certbot python3-certbot-nginx` (veya
> `python3-certbot-apache`) ile `sudo certbot --nginx` (veya `--apache`)
> çalıştırarak ücretsiz Let's Encrypt sertifikası ekleyebilirsiniz.
> `NEXTAUTH_URL`'i o zaman `https://...` olarak güncellemeyi unutmayın.

**8. İlk admin hesabını oluştur**

Bu projede kurulum sihirbazı yok — admin hesabı iki adımda oluşturulur:

1. Siteye gerçek adresinizden (ör. `https://lucidmove.net/register`) normal
   bir üye olarak kaydolun.
2. Sunucuda bu kullanıcıyı admin yapın:
   ```bash
   npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/make-admin.ts eposta@ornek.com
   ```

> Örnek kurs/kategori/fiyat verisiyle başlamak isterseniz
> `npx prisma db seed` çalıştırabilirsiniz — `NODE_ENV=production` olduğu
> için (`prisma/seed.ts`'teki kontrol) admin hesabı **oluşturmaz**, yalnızca
> örnek içerik ekler; içeriği zaten admin panelden kendiniz gireceksiniz,
> isterseniz bu adımı tamamen atlayabilirsiniz.

**9. Uygulamayı arka planda kalıcı tut (pm2)**

6. adımda `npm start`'ı doğrudan terminalde çalıştırdıysanız, SSH oturumunu
kapattığınızda process de ölür. Kalıcı çalışması için bir process manager
gerekir:

```bash
npm install -g pm2
pm2 start npm --name lucidmove -- start
pm2 save
pm2 startup
```

`pm2 startup` komutunun bastığı `sudo env PATH=...` ile başlayan satırı
kopyalayıp çalıştırın — bu, sunucu yeniden başladığında pm2'nin (ve
dolayısıyla uygulamanın) otomatik ayağa kalkmasını sağlar.

> **Not — panel içi güncelleme:** Sistem yöneticisi girişiyle
> **Ayarlar → Güncelleme** sayfasından `git fetch/merge` + `npm install` +
> `prisma generate` + `prisma migrate deploy` + `npm run build` adımları tek
> tıkla (arayüzden) çalıştırılabilir (bkz. `lib/gitUpdate.ts`). **Ama süreç
> kendi başına process'i yeniden başlatmaz** — build bittiğinde eski process
> hâlâ ayakta kalıp eski (artık diskte olmayan) statik dosya adlarını
> sunmaya devam eder, bu da tarayıcıda CSS/JS'in 400/404 ile
> yüklenememesine yol açar. pm2 altında çalışıyorsanız (yukarıdaki adım)
> güncelleme başarılı bittikten sonra ekranda çıkan **"Yeniden başlat"**
> butonuna basın — bu, pm2 üzerinden process'i yeniden başlatır. Buton
> görünmüyorsa (pm2 algılanamadıysa, ör. process pm2 dışında başlatıldıysa)
> elle `pm2 restart lucidmove` çalıştırmanız gerekir.

## 5. Iyzico entegrasyonu nasıl çalışır?

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

## 6. Video ekleme ve barındırma hakkında not

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

## 7. Veritabanı şeması

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

## 8. Admin paneli

Site içeriğinin tamamı (`/admin` altında) bir yönetim panelinden düzenlenir:

- **Panel** (`/admin`) — üye/abonelik/gelir/mesaj özeti
- **Kurslar** (`/admin/courses`) — kurs ve ders ekleme, düzenleme, silme
- **Fiyatlandırma** (`/admin/pricing`) — aylık/yıllık plan fiyat ve içeriği
- **Genel Ayarlar** (`/admin/settings`) — para birimi, analitik, iletişim
  bilgisi, SEO başlığı (hero/üyelik metinleri, eğitmen profili ve galeri artık
  `/admin/settings/page-design` altında)
- **Mesajlar** (`/admin/messages`) — iletişim formundan gelen mesajlar
- **Üyelikler** (`/admin/subscriptions`) — tüm aboneliklerin durumu, admin iptali

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

## 9. Sırada ne var?

Bu iskelet çalışan bir temel sunar; canlıya almadan önce şunları da
düşünebilirsiniz:

- **Otomatik yenileme:** Şu an her ödeme, Iyzico'nun tek seferlik "Checkout
  Form" akışıyla alınıyor — dönem bitince otomatik tekrar tahsilat yapılmıyor.
  Gerçek bir otomatik-yenilemeli abonelik için Iyzico'nun ayrı **Abonelik
  (Subscription) API**'sine geçmeniz gerekir. Şimdilik `/account` sayfasından
  kullanıcılar üyeliklerini görüntüleyip iptal edebiliyor.
- Şifre sıfırlama akışı (e-posta ile)
- Fatura/e-posta bildirimleri (Resend, Postmark vb.)
- Admin panelden görsel **dosya yükleme** (şu an tüm görseller URL olarak
  yapıştırılıyor — Unsplash veya kendi barındırdığınız bir görsel adresi)
- SEO için `sitemap.xml` ve `robots.txt`
