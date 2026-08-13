import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { yuklemeyiBitir } from "@/lib/parcaliYukleme";

const sema = z.object({ uploadId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = sema.safeParse(await req.json());
  if (!govde.success) return NextResponse.json({ hata: "Geçersiz istek" }, { status: 400 });

  const sonuc = await yuklemeyiBitir({ uploadId: govde.data.uploadId, kullaniciId: session.user.id });
  if ("hata" in sonuc) return NextResponse.json(sonuc, { status: 400 });

  return NextResponse.json(sonuc);
}
