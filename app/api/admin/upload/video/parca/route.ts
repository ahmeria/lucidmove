import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { parcaYaz } from "@/lib/parcaliYukleme";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const form = await req.formData();
  const uploadId = form.get("uploadId");
  const index = form.get("index");
  const parca = form.get("parca");

  if (typeof uploadId !== "string" || typeof index !== "string" || !(parca instanceof File)) {
    return NextResponse.json({ hata: "Geçersiz istek" }, { status: 400 });
  }

  const buffer = Buffer.from(await parca.arrayBuffer());
  const sonuc = await parcaYaz({
    uploadId,
    index: Number(index),
    veri: buffer,
    kullaniciId: session.user.id,
  });
  if ("hata" in sonuc) return NextResponse.json(sonuc, { status: 400 });

  return NextResponse.json(sonuc);
}
