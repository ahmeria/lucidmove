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
  // Spam tuzakları (bkz. IletisimForm.tsx): "website" gerçek kullanıcıya
  // görünmeyen bir alan, botlar doldurur; "sure" formun açılmasından gönderime
  // kadar geçen ms — botlar ya hiç göndermez ya da anında gönderir.
  website: z.string().optional(),
  sure: z.number().optional(),
});

const MINIMUM_DOLDURMA_SURESI_MS = 3000;

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

  const { website, sure, ...mesaj } = sonuc.data;
  // Bot olduğu düşünülen gönderimler sessizce yutulur — hata dönülürse bot
  // neyin yakalandığını öğrenip uyum sağlayabilir.
  // ponytail: honeypot + süre basit botları keser; hedefli spam sürerse Cloudflare Turnstile ekle.
  if (website || sure === undefined || sure < MINIMUM_DOLDURMA_SURESI_MS) {
    return NextResponse.json({ basarili: true });
  }

  // Not: Burada gerçek üretimde ayrıca bir e-posta servisi (Resend, Postmark,
  // SES vb.) ile CONTACT_EMAIL_TO adresine bildirim gönderilebilir. Mesaj,
  // admin panelinden görüntülenebilmesi için ContactMessage tablosuna yazılıyor.
  await db.contactMessage.create({ data: mesaj });

  return NextResponse.json({ basarili: true });
}
