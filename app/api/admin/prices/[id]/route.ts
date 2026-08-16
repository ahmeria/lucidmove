import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const cevSemasi = z.string().optional();

const fiyatSemasi = z.object({
  baslik: z.string().min(2),
  baslikEn: cevSemasi,
  baslikAz: cevSemasi,
  fiyat: z.number().positive(),
  periyot: z.string().min(1),
  periyotEn: cevSemasi,
  periyotAz: cevSemasi,
  aciklama: z.string().min(2),
  aciklamaEn: cevSemasi,
  aciklamaAz: cevSemasi,
  ozellikler: z.string().min(2),
  ozelliklerEn: cevSemasi,
  ozelliklerAz: cevSemasi,
  rozet: z.string().nullable(),
  rozetEn: cevSemasi,
  rozetAz: cevSemasi,
  vurgulu: z.boolean(),
  sira: z.number().int(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = fiyatSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const { rozet, rozetEn, rozetAz, ...geriKalan } = govde.data;
  const plan = await db.pricingPlan.update({
    where: { id: params.id },
    data: { ...geriKalan, rozet: rozet || null, rozetEn: rozetEn || null, rozetAz: rozetAz || null },
  });

  return NextResponse.json({ basarili: true, plan });
}
