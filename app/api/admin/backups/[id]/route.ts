import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { db } from "@/lib/db";
import { yedekDosyaYolunuAl } from "@/lib/backup";
import { logKaydet } from "@/lib/systemLog";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/backups")) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const yedek = await db.backup.findUnique({ where: { id: params.id } });
  if (!yedek) return NextResponse.json({ hata: "Yedek bulunamadı" }, { status: 404 });

  try {
    await unlink(yedekDosyaYolunuAl(yedek.dosyaAdi));
  } catch {
    // Dosya zaten yoksa (elle silinmiş vb.) kayıt yine de temizlenir.
  }
  await db.backup.delete({ where: { id: params.id } });
  await logKaydet({
    seviye: "INFO",
    kategori: "yedekleme",
    aksiyon: "sil",
    kaynakEtiketi: yedek.dosyaAdi,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
