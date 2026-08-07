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
  return true;
}

// Route handler'larda istemci IP'sini en iyi çabayla (best-effort) çıkarır.
// Güvenilmeyen bir proxy arkasında sahtelenebilir — burada yalnızca spam/hız
// sınırlama amaçlı kullanılıyor, yetkilendirme kararı için DEĞİL.
export function istemciIpAdresiniAl(req: Request): string {
  const ileriIcin = req.headers.get("x-forwarded-for");
  if (ileriIcin) return ileriIcin.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "bilinmeyen";
}
