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
}

function maskele(deger: string): string {
  if (deger.length <= 10) return "••••••••";
  return `${deger.slice(0, 8)}••••••••${deger.slice(-4)}`;
}

export function iyzicoDurumunuAl(): IyzicoDurumu {
  const apiKey = process.env.IYZICO_API_KEY || "";
  const secretKey = process.env.IYZICO_SECRET_KEY || "";
  const baseUrl = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

  let mod: IyzicoDurumu["mod"] = "bilinmiyor";
  if (baseUrl.includes("sandbox-api")) mod = "sandbox";
  else if (baseUrl.includes("api.iyzipay.com")) mod = "canli";

  return {
    apiKeyVarMi: apiKey.length > 0,
    secretKeyVarMi: secretKey.length > 0,
    yapilandirilmisMi: apiKey.length > 0 && secretKey.length > 0,
    mod,
    baseUrl,
    maskelenmisApiKey: apiKey ? maskele(apiKey) : null,
  };
}
