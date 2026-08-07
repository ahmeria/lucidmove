import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const semasi = z.object({
  siteBasligi: z.string().min(2),
  siteAciklamasi: z.string().min(2),
  heroEyebrow: z.string().min(1),
  heroBaslik: z.string().min(1),
  heroAltBaslik: z.string().min(1),
  heroCtaBirincil: z.string().min(1),
  heroCtaIkincil: z.string().min(1),
  uyelikEyebrow: z.string().min(1),
  uyelikBaslik: z.string().min(1),
  uyelikAltBaslik: z.string().min(1),
  iletisimEmail: z.string().email(),
  calismaSaatleri: z.string().min(1),
  instagramUrl: z.string().url(),
  footerTagline: z.string().min(1),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const ayarlar = await db.siteSettings.upsert({
    where: { id: "ana" },
    update: govde.data,
    create: { id: "ana", ...govde.data },
  });

  return NextResponse.json({ basarili: true, ayarlar });
}
