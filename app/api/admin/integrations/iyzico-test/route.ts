import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { iyzico } from "@/lib/iyzico";
import { iyzicoDurumunuAl } from "@/lib/iyzicoDurumu";

export const dynamic = "force-dynamic";

// iyzipay paketi TypeScript tanımı sunmuyor (types/@types/iyzipay yok) — TS,
// Iyzipay.js'in yapısını kendi çıkarımıyla okuyor ve apiTest kaynağını
// (runtime'da gerçekten var, bkz. node_modules/iyzipay/samples) bu çıkarıma
// dahil etmiyor. Yalnızca bu tek çağrı için minimal bir tip genişletmesi.
type IyzicoApiTestDestekli = typeof iyzico & {
  apiTest: {
    retrieve: (
      request: Record<string, never>,
      callback: (err: unknown, result: { status?: string; errorMessage?: string }) => void
    ) => void;
  };
};

// Iyzico'nun kimlik doğrulama/bağlantı testi için sunduğu özel uç nokta —
// gerçek bir işlem/tahsilat oluşturmaz, yalnızca API Key + Secret Key'in
// geçerli olduğunu doğrular (bkz. iyzipay SDK > apiTest.retrieve).
function baglantiTestiYap(): Promise<{ status?: string; errorMessage?: string }> {
  return new Promise((resolve, reject) => {
    (iyzico as IyzicoApiTestDestekli).apiTest.retrieve({}, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export async function POST() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/integrations")) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const durum = iyzicoDurumunuAl();
  if (!durum.yapilandirilmisMi) {
    return NextResponse.json({ basarili: false, mesaj: "API Key veya Secret Key .env dosyasında tanımlı değil." }, { status: 400 });
  }

  try {
    const sonuc = await baglantiTestiYap();
    if (sonuc.status === "success") {
      return NextResponse.json({ basarili: true, mesaj: `Bağlantı başarılı — ${durum.mod === "sandbox" ? "sandbox" : "canlı"} modda çalışıyor.` });
    }
    return NextResponse.json({ basarili: false, mesaj: sonuc.errorMessage || "Iyzico bağlantı testi başarısız oldu." }, { status: 400 });
  } catch (err) {
    const mesaj = err instanceof Error ? err.message : "Iyzico'ya bağlanılamadı.";
    return NextResponse.json({ basarili: false, mesaj }, { status: 502 });
  }
}
