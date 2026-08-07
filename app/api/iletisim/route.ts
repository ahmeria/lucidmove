import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const mesajSemasi = z.object({
  ad: z.string().min(2),
  email: z.string().email(),
  mesaj: z.string().min(5),
});

export async function POST(req: Request) {
  const govde = await req.json();
  const sonuc = mesajSemasi.safeParse(govde);

  if (!sonuc.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  // Not: Burada gerçek üretimde ayrıca bir e-posta servisi (Resend, Postmark,
  // SES vb.) ile CONTACT_EMAIL_TO adresine bildirim gönderilebilir. Mesaj,
  // admin panelinden görüntülenebilmesi için ContactMessage tablosuna yazılıyor.
  await db.contactMessage.create({ data: sonuc.data });

  return NextResponse.json({ basarili: true });
}
