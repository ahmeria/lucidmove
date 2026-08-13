import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { PARA_BIRIMLERI, PARA_BIRIMI_GOSTERIMLERI } from "@/lib/settings";

const semasi = z.object({
  paraBirimi: z.enum(PARA_BIRIMLERI),
  paraBirimiGosterimi: z.enum(PARA_BIRIMI_GOSTERIMLERI),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const ayarlar = await db.siteSettings.update({
    where: { id: "ana" },
    data: govde.data,
  });

  return NextResponse.json({ basarili: true, ayarlar });
}
