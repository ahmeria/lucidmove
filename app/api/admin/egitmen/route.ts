import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const semasi = z.object({
  ad: z.string().min(2),
  bio: z.string().min(2),
  sertifikalar: z.string(),
  yaklasim: z.string(),
  portreUrl: z.string().url(),
  hakkimdaTeaserOzet: z.string().min(2),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const profil = await db.instructorProfile.upsert({
    where: { id: "ana" },
    update: govde.data,
    create: { id: "ana", ...govde.data },
  });

  return NextResponse.json({ basarili: true, profil });
}
