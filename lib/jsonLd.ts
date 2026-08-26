// JSON-LD <script> etiketlerine güvenle basılabilecek bir JSON dizgisi üretir.
// JSON.stringify tek başına "<" karakterini kaçırmaz — admin'in girdiği bir
// metin (ör. kamp detayları, kurs açıklaması) "</script><script>…" içeriyorsa
// bu, JSON-LD bloğundan çıkıp sayfaya rastgele script enjekte edebilir
// (stored XSS, tüm herkese açık ziyaretçileri etkiler). "<" -> "<"
// kaçırma dönüşümü JSON içinde anlamı DEĞİŞTİRMEZ (JSON parser'lar \uXXXX
// kaçışlarını olduğu gibi çözer) ama tarayıcının HTML parser'ının bunu bir
// etiket başlangıcı sanmasını engeller.
export function jsonLdGuvenli(deger: unknown): string {
  return JSON.stringify(deger).replace(/</g, "\\u003c");
}
