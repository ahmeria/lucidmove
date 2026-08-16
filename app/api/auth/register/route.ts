import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { hizSiniriniKontrolEt, istemciIpAdresiniAl } from "@/lib/rateLimit";

const KAYIT_LIMITI = 5;
const KAYIT_PENCERESI_MS = 60 * 60 * 1000; // 1 saat

const kayitSemasi = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  // Telefon zorunlu değil — boş string de kabul edilir, aşağıda null'a çevrilir.
  telefon: z.string().trim().max(32, "Telefon numarası çok uzun").optional(),
});

export async function POST(req: Request) {
  const ip = istemciIpAdresiniAl(req);
  if (!hizSiniriniKontrolEt(`register:${ip}`, KAYIT_LIMITI, KAYIT_PENCERESI_MS)) {
    return NextResponse.json({ kod: "COK_FAZLA_DENEME" }, { status: 429 });
  }

  const govde = await req.json();
  const sonuc = kayitSemasi.safeParse(govde);

  if (!sonuc.success) {
    return NextResponse.json({ kod: "GECERSIZ_VERI" }, { status: 400 });
  }

  const { ad, email, password, telefon } = sonuc.data;
  const normalizedEmail = email.toLowerCase();

  const mevcutKullanici = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (mevcutKullanici) {
    return NextResponse.json({ kod: "EPOSTA_KAYITLI" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const kullanici = await db.user.create({
    data: { ad, email: normalizedEmail, passwordHash, telefon: telefon || null },
  });

  return NextResponse.json({ id: kullanici.id, email: kullanici.email }, { status: 201 });
}
