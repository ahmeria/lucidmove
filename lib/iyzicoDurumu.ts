// Admin panel > Ayarlar > Entegrasyon sayfası için Iyzico yapılandırma
// durumunu .env'den okur — gerçek anahtar değerleri asla istemciye/UI'a
// tam olarak gönderilmez, yalnızca maskelenmiş bir önizleme ve durum bilgisi.
export interface IyzicoDurumu {
  apiKeyVarMi: boolean;
  secretKeyVarMi: boolean;
  yapilandirilmisMi: boolean;
  mod: "sandbox" | "canli" | "bilinmiyor";
  baseUrl: string;
  maskelenmisApiKey: string | null;
  // Iyzico'nun ödeme sonucunu POST edeceği adres — panelde elle girilmez,
  // her checkout isteğinde otomatik gönderilir (bkz. lib/iyzico.ts >
  // odemeFormuBaslat, app/api/uyelik/checkout/route.ts). NEXTAUTH_URL
  // yanlışsa (boş/localhost/http) ödemeler tamamlandıktan sonra siteye
  // hiç dönmez — bu yüzden burada görünür kılınıyor.
  callbackUrl: string;
  nextAuthUrlGecerliMi: boolean;
  siteDomaini: string | null;
}

function maskele(deger: string): string {
  if (deger.length <= 10) return "••••••••";
  return `${deger.slice(0, 8)}••••••••${deger.slice(-4)}`;
}

export function iyzicoDurumunuAl(): IyzicoDurumu {
  const apiKey = process.env.IYZICO_API_KEY || "";
  const secretKey = process.env.IYZICO_SECRET_KEY || "";
  const baseUrl = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";
  const nextAuthUrl = process.env.NEXTAUTH_URL || "";

  let mod: IyzicoDurumu["mod"] = "bilinmiyor";
  if (baseUrl.includes("sandbox-api")) mod = "sandbox";
  else if (baseUrl.includes("api.iyzipay.com")) mod = "canli";

  // "Geçerli" burada yalnızca biçimsel bir kontrol — gerçekten Iyzico'dan
  // dönüşü alabilmek için ayrıca herkese açık, https ile erişilebilir bir
  // adres olması gerekir (yerelde/localhost'ta bu doğal olarak çalışmaz).
  const nextAuthUrlGecerliMi = /^https?:\/\/.+/.test(nextAuthUrl);
  let siteDomaini: string | null = null;
  try {
    siteDomaini = nextAuthUrlGecerliMi ? new URL(nextAuthUrl).host : null;
  } catch {
    siteDomaini = null;
  }

  return {
    apiKeyVarMi: apiKey.length > 0,
    secretKeyVarMi: secretKey.length > 0,
    yapilandirilmisMi: apiKey.length > 0 && secretKey.length > 0,
    mod,
    baseUrl,
    maskelenmisApiKey: apiKey ? maskele(apiKey) : null,
    callbackUrl: `${nextAuthUrl}/api/uyelik/webhook`,
    nextAuthUrlGecerliMi,
    siteDomaini,
  };
}
