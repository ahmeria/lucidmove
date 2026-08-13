import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hizSiniriniKontrolEt, istemciIpAdresiniAl } from "@/lib/rateLimit";

const ILETISIM_LIMITI = 5;
const ILETISIM_PENCERESI_MS = 60 * 60 * 1000; // 1 saat

const mesajSemasi = z.object({
  ad: z.string().min(2).max(255),
  email: z.string().email().max(255),
  mesaj: z.string().min(5).max(5000),
});

export async function POST(req: Request) {
  const ip = istemciIpAdresiniAl(req);
  if (!hizSiniriniKontrolEt(`iletisim:${ip}`, ILETISIM_LIMITI, ILETISIM_PENCERESI_MS)) {
    return NextResponse.json({ hata: "Çok fazla mesaj gönderildi — lütfen daha sonra tekrar deneyin" }, { status: 429 });
  }

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
