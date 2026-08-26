// Basit, bellek-içi ("sliding window") hız sınırlama — Redis yok, projenin
// mevcut "tek Node process" ölçeğiyle tutarlı (bkz. lib/backup.ts'teki
// process-içi kilit deseniyle aynı felsefe). Process yeniden başlayınca sayaçlar
// sıfırlanır — küçük ölçekli kaba kuvvet/spam koruması için yeterli, dağıtık bir
// sistemde (birden çok sunucu instance'ı) paylaşılmaz.
const globalForRateLimit = globalThis as unknown as { rateLimitDeposu?: Map<string, number[]> };
const deposu = globalForRateLimit.rateLimitDeposu ?? (globalForRateLimit.rateLimitDeposu = new Map<string, number[]>());

// true: izin verildi (deneme kaydedildi) | false: limit aşıldı (deneme kaydedilmedi)
export function hizSiniriniKontrolEt(anahtar: string, maksimumDeneme: number, pencereMs: number): boolean {
  const simdi = Date.now();
  const gecmisDenemeler = (deposu.get(anahtar) ?? []).filter((t) => simdi - t < pencereMs);

  if (gecmisDenemeler.length >= maksimumDeneme) {
    deposu.set(anahtar, gecmisDenemeler);
    return false;
  }

  gecmisDenemeler.push(simdi);
  deposu.set(anahtar, gecmisDenemeler);

  // Anahtar sayısı sınırsız büyümesin diye (ör. rastgele e-posta/IP denemeleri
  // ile "login:<rastgele>" gibi hiç tekrar kullanılmayacak anahtarlar üretmek)
  // arada bir, artık aktif denemesi kalmamış eski anahtarları temizle. Her
  // çağrıda değil — pencere boyunca birikmiş anahtar sayısı belli bir eşiği
  // geçtiğinde (ucuz bir sezgisel: 5000 anahtar), tüm depoyu bir kez tarar.
  if (deposu.size > 5000) {
    for (const [k, denemeler] of deposu) {
      if (denemeler.every((t) => simdi - t >= pencereMs)) deposu.delete(k);
    }
  }

  return true;
}

// Route handler'larda istemci IP'sini en iyi çabayla (best-effort) çıkarır.
// GÜVENLİK: X-Forwarded-For listesindeki İLK değer istemcinin kendi
// gönderdiği, dolayısıyla İSTEMCİ TARAFINDAN SERBESTÇE AYARLANABİLEN bir
// değerdir — "X-Forwarded-For: 1.2.3.4" başlığıyla her istekte farklı bir
// IP "iddia ederek" hız sınırlamasını (kayıt/iletişim formu spam koruması)
// tamamen atlatmak mümkündü. Üretim ortamında (Apache reverse proxy →
// Node) tek bir GÜVENİLİR proxy hopu var — o proxy, kendi gördüğü GERÇEK
// istemci IP'sini listenin SONUNA ekler (ya da X-Real-IP'yi kendisi set
// eder); listenin başındaki değerler istemcinin uydurabileceği önceki
// hoplardır. Bu yüzden X-Real-IP varsa ona, yoksa X-Forwarded-For'un EN
// SON (en sağdaki) değerine güveniyoruz — en soldakine değil. Yine de bu
// yalnızca spam/hız sınırlama amaçlı — yetkilendirme kararı için DEĞİL.
export function istemciIpAdresiniAl(req: Request): string {
  const gercekIp = req.headers.get("x-real-ip");
  if (gercekIp) return gercekIp.trim();

  const ileriIcin = req.headers.get("x-forwarded-for");
  if (ileriIcin) {
    const parcalar = ileriIcin.split(",").map((p) => p.trim()).filter(Boolean);
    if (parcalar.length > 0) return parcalar[parcalar.length - 1];
  }

  return "bilinmeyen";
}
