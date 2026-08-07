import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const profilSemasi = z.object({
  ad: z.string().min(2),
  telefon: z.string().trim().max(32, "Telefon numarası çok uzun").optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ hata: "Giriş yapmalısınız" }, { status: 401 });

  const govde = profilSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { ad: govde.data.ad, telefon: govde.data.telefon || null },
  });
  return NextResponse.json({ basarili: true });
}
