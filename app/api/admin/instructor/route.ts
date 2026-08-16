import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const cevSemasi = z.string().optional();

const semasi = z.object({
  ad: z.string().min(2),
  bio: z.string().min(2),
  bioEn: cevSemasi,
  bioAz: cevSemasi,
  sertifikalar: z.string(),
  sertifikalarEn: cevSemasi,
  sertifikalarAz: cevSemasi,
  yaklasim: z.string(),
  yaklasimEn: cevSemasi,
  yaklasimAz: cevSemasi,
  // Yükleme /uploads/... gibi göreli bir yol üretiyor (mutlak URL değil) —
  // bkz. components/admin/GorselInput.tsx.
  portreUrl: z.string().min(1),
  hakkimdaTeaserOzet: z.string().min(2),
  hakkimdaTeaserOzetEn: cevSemasi,
  hakkimdaTeaserOzetAz: cevSemasi,
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
