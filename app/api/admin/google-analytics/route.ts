import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// Boş string -> null (bağlantıyı kaldırma). Doluysa GA4 Measurement ID biçimi ("G-XXXXXXXXXX").
const semasi = z.object({
  gaMeasurementId: z
    .string()
    .trim()
    .regex(/^G-[A-Z0-9]{4,12}$/, "Geçerli bir Measurement ID girin (ör. G-ABC1234XYZ)")
    .optional()
    .or(z.literal("")),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: govde.error.issues[0]?.message || "Geçersiz form verisi" }, { status: 400 });
  }

  const ayarlar = await db.siteSettings.update({
    where: { id: "ana" },
    data: { gaMeasurementId: govde.data.gaMeasurementId || null },
  });

  return NextResponse.json({ basarili: true, ayarlar });
}
