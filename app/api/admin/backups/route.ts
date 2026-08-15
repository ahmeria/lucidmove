import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { yedekAl } from "@/lib/backup";
import { logKaydet } from "@/lib/systemLog";

export async function POST() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/backups")) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const sonuc = await yedekAl(session.user?.id);

  await logKaydet({
    seviye: sonuc.basarili ? "INFO" : "ERROR",
    kategori: "yedekleme",
    aksiyon: sonuc.basarili ? "olustur" : "hata",
    kaynakEtiketi: sonuc.dosyaAdi,
    mesaj: sonuc.hataMesaji,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  if (!sonuc.basarili) {
    return NextResponse.json({ hata: sonuc.hataMesaji || "Yedekleme başarısız" }, { status: 500 });
  }
  return NextResponse.json({ basarili: true });
}
