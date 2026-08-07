// Giriş/kayıt sonrası ?sonra= parametresiyle gelen yönlendirme hedefini doğrular.
// Doğrulanmadan kullanılırsa açık yönlendirme (open redirect) açığı oluşur: bir
// saldırgan "/giris?sonra=https://sahte-site.com" bağlantısı paylaşır, kurban
// gerçek sitede başarıyla giriş yapar ama ardından dış bir siteye yönlendirilir
// (oltalama saldırılarında güven kazanmak için kullanılan klasik bir teknik).
//
// Yalnızca "/" ile başlayan, "//" veya ":" İÇERMEYEN göreli yollara izin verilir:
// - "//evil.com" ve "https://evil.com" gibi protokol-göreli/mutlak adresler reddedilir.
// - "/admin" gibi site-içi yollar kabul edilir.
export function guvenliYonlendirmeHedefi(sonra: string | null | undefined, varsayilan: string): string {
  if (!sonra) return varsayilan;
  if (!sonra.startsWith("/")) return varsayilan;
  if (sonra.startsWith("//")) return varsayilan;
  if (sonra.includes(":")) return varsayilan;
  return sonra;
}
