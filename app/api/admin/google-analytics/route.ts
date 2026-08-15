import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { db } from "@/lib/db";
import {
  analitikAyarlariniAl,
  analitikAyarlariniKaydet,
  analitikBaglantisiniTestEt,
  analitikCacheTemizle,
  servisHesabiniAyristir,
} from "@/lib/analitikVerisi";

// Boş: değiştirme. "-": kayıtlı hesabı sil. Aksi hâlde JSON anahtar dosyasının içeriği.
const semasi = z.object({
  gaMeasurementId: z
    .string()
    .trim()
    .regex(/^G-[A-Z0-9]{4,12}$/, "Geçerli bir Measurement ID girin (ör. G-ABC1234XYZ)")
    .optional()
    .or(z.literal("")),
  gaPropertyId: z
    .string()
    .trim()
    .regex(/^\d+$/, "Property ID yalnızca rakamlardan oluşur (ör. 493812345)")
    .optional()
    .or(z.literal("")),
  servisHesabi: z.string().trim().max(20000).optional(),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings")) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: govde.error.issues[0]?.message || "Geçersiz form verisi" }, { status: 400 });
  }

  const { gaMeasurementId, gaPropertyId, servisHesabi } = govde.data;

  // Bozuk JSON şifrelenip kaydedilirse hata ancak ilk rapor çekiminde ortaya çıkar; burada
  // yakalanıp anlaşılır bir mesaja çevriliyor.
  if (servisHesabi && servisHesabi !== "-") {
    try {
      servisHesabiniAyristir(servisHesabi);
    } catch (err) {
      return NextResponse.json({ hata: err instanceof Error ? err.message : "Geçersiz servis hesabı" }, { status: 400 });
    }
  }

  await analitikAyarlariniKaydet({
    measurementId: gaMeasurementId || "",
    propertyId: gaPropertyId || "",
    servisHesabi,
  });

  const ayarlar = await db.siteSettings.findUnique({ where: { id: "ana" } });
  return NextResponse.json({ basarili: true, ayarlar, analitik: await analitikAyarlariniAl() });
}

/** Ayarlar ekranındaki "Bağlantıyı Test Et" düğmesi — kayıtlı bilgilerle gerçek bir rapor çeker. */
export async function POST() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings")) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  analitikCacheTemizle();
  // Başarısız test bir İSTEK hatası değil, bir SONUÇ: HTTP 200 dönüp `basarili` alanıyla
  // ayırt ediliyor ki istemci mesajı olduğu gibi gösterebilsin.
  return NextResponse.json(await analitikBaglantisiniTestEt());
}
