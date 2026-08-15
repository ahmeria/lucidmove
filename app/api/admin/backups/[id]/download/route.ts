import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { db } from "@/lib/db";
import { yedekDosyaYolunuAl } from "@/lib/backup";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/backups")) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const yedek = await db.backup.findUnique({ where: { id: params.id } });
  if (!yedek || yedek.durum !== "basarili") {
    return NextResponse.json({ hata: "Yedek bulunamadı" }, { status: 404 });
  }

  try {
    const veri = await readFile(yedekDosyaYolunuAl(yedek.dosyaAdi));
    return new NextResponse(veri, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${yedek.dosyaAdi}"`,
        "Content-Length": String(veri.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ hata: "Yedek dosyası diskte bulunamadı" }, { status: 404 });
  }
}
