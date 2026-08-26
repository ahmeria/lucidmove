import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

// Slug istemciden alınmıyor — admin panelinde ayrı bir alanı yok, addan
// otomatik türetiliyor (bkz. app/admin/camps/CampForm.tsx, courses'daki aynı desen).
const cevSemasi = z.string().optional();

const kampSemasi = z
  .object({
    ad: z.string().min(2),
    adEn: cevSemasi,
    adAz: cevSemasi,
    yer: z.string().min(2),
    yerEn: cevSemasi,
    yerAz: cevSemasi,
    detaylar: z.string().min(2),
    detaylarEn: cevSemasi,
    detaylarAz: cevSemasi,
    baslangicTarihi: z.coerce.date(),
    bitisTarihi: z.coerce.date(),
    kapasite: z.coerce.number().int().min(1),
    fiyat: z.coerce.number().min(0),
    rezervasyonSuresiGun: z.coerce.number().int().min(1).default(3),
    kapakUrl: gorselUrlSemasiOpsiyonel,
    yayindaMi: z.boolean().default(true),
  })
  .refine((v) => v.bitisTarihi >= v.baslangicTarihi, {
    message: "Bitiş tarihi başlangıçtan önce olamaz",
    path: ["bitisTarihi"],
  });

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = kampSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const {
    ad,
    adEn,
    adAz,
    yer,
    yerEn,
    yerAz,
    detaylar,
    detaylarEn,
    detaylarAz,
    baslangicTarihi,
    bitisTarihi,
    kapasite,
    fiyat,
    rezervasyonSuresiGun,
    kapakUrl,
    yayindaMi,
  } = govde.data;
  const slug = slugifyTr(ad);

  try {
    const kamp = await db.camp.create({
      data: {
        ad,
        adEn: adEn || null,
        adAz: adAz || null,
        slug,
        yer,
        yerEn: yerEn || null,
        yerAz: yerAz || null,
        detaylar,
        detaylarEn: detaylarEn || null,
        detaylarAz: detaylarAz || null,
        baslangicTarihi,
        bitisTarihi,
        kapasite,
        fiyat,
        rezervasyonSuresiGun,
        kapakUrl: kapakUrl || null,
        yayindaMi,
      },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "kamp",
      aksiyon: "olustur",
      kaynakEtiketi: kamp.ad,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, kamp });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Kamp oluşturulamadı" }, { status: 500 });
  }
}
