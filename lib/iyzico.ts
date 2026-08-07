import Iyzipay from "iyzipay";

// Iyzico istemcisi. Sandbox anahtarları .env dosyanızdan okunur —
// gerçek anahtarları .env.example dosyasındaki yönergelere göre girin.
export const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || "",
  secretKey: process.env.IYZICO_SECRET_KEY || "",
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
});

interface OdemeBaslatParams {
  conversationId: string;
  plan: "AYLIK" | "YILLIK";
  fiyat: string;
  kullanici: { id: string; ad: string; email: string };
  callbackUrl: string;
}

// Iyzico "Checkout Form" akışını başlatır: kullanıcı, kart bilgilerini
// Iyzico'nun barındırdığı güvenli formda girer; biz kart verisini hiç
// görmeyiz/saklamayız. Sonuç callbackUrl'e POST edilir.
export function odemeFormuBaslat({ conversationId, plan, fiyat, kullanici, callbackUrl }: OdemeBaslatParams) {
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId,
    price: fiyat,
    paidPrice: fiyat,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: `uyelik-${plan.toLowerCase()}-${kullanici.id}`,
    paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: kullanici.id,
      name: kullanici.ad.split(" ")[0] || kullanici.ad,
      surname: kullanici.ad.split(" ").slice(1).join(" ") || "-",
      email: kullanici.email,
      identityNumber: "11111111111", // Not: gerçek üretimde kullanıcıdan alınmalı
      registrationAddress: "Belirtilmedi",
      ip: "85.34.78.112",
      city: "Istanbul",
      country: "Turkey",
    },
    shippingAddress: {
      contactName: kullanici.ad,
      city: "Istanbul",
      country: "Turkey",
      address: "Dijital ürün — kargo adresi gerekmez",
    },
    billingAddress: {
      contactName: kullanici.ad,
      city: "Istanbul",
      country: "Turkey",
      address: "Dijital ürün — fatura adresi gerekmez",
    },
    basketItems: [
      {
        id: `plan-${plan.toLowerCase()}`,
        name: plan === "AYLIK" ? "LucidMove — Aylık Üyelik" : "LucidMove — Yıllık Üyelik",
        category1: "Üyelik",
        itemType: "VIRTUAL",
        price: fiyat,
      },
    ],
  };

  return new Promise((resolve, reject) => {
    iyzico.checkoutFormInitialize.create(request, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function odemeSonucunuGetir(token: string) {
  return new Promise((resolve, reject) => {
    iyzico.checkoutForm.retrieve(
      { locale: Iyzipay.LOCALE.TR, conversationId: token, token },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}
