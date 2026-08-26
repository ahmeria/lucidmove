// Giriş/kayıt sonrası ?returnTo= parametresiyle gelen yönlendirme hedefini doğrular.
// Doğrulanmadan kullanılırsa açık yönlendirme (open redirect) açığı oluşur: bir
// saldırgan "/login?returnTo=https://sahte-site.com" bağlantısı paylaşır, kurban
// gerçek sitede başarıyla giriş yapar ama ardından dış bir siteye yönlendirilir
// (oltalama saldırılarında güven kazanmak için kullanılan klasik bir teknik).
//
// Yalnızca "/" ile başlayan, "//" veya ":" İÇERMEYEN göreli yollara izin verilir:
// - "//evil.com" ve "https://evil.com" gibi protokol-göreli/mutlak adresler reddedilir.
// - "/admin" gibi site-içi yollar kabul edilir.
// - "\" da reddedilir: tarayıcılar (WHATWG URL "relative slash state") ters
//   eğik çizgiyi de "/" gibi yorumluyor, bu yüzden "/\evil.com" yukarıdaki
//   kontrolleri geçip https://evil.com'a çözülebiliyordu (açık yönlendirme).
export function guvenliYonlendirmeHedefi(hedef: string | null | undefined, varsayilan: string): string {
  if (!hedef) return varsayilan;
  if (!hedef.startsWith("/")) return varsayilan;
  if (hedef.startsWith("//")) return varsayilan;
  if (hedef.includes(":")) return varsayilan;
  if (hedef.includes("\\")) return varsayilan;
  return hedef;
}
