import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const fiyatSemasi = z.object({
  baslik: z.string().min(2),
  fiyat: z.number().positive(),
  periyot: z.string().min(1),
  aciklama: z.string().min(2),
  ozellikler: z.string().min(2),
  rozet: z.string().nullable(),
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

  const { rozet, ...geriKalan } = govde.data;
  const plan = await db.pricingPlan.update({
    where: { id: params.id },
    data: { ...geriKalan, rozet: rozet || null },
  });

  return NextResponse.json({ basarili: true, plan });
}
