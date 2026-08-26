import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugifyTr } from "@/lib/slugify";
import { gorselUrlSemasiOpsiyonel } from "@/lib/gorsel";
import { logKaydet } from "@/lib/systemLog";

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

// Düzenleme ekranındaki "Rezervasyonları görüntüle (N)" bağlantısı için —
// bkz. app/admin/courses/[id]/route.ts'teki aynı gerekçe (silme öncesi
// etkilenen kayıt sayısını göstermek).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const rezervasyonSayisi = await db.campReservation.count({ where: { campId: params.id } });
  return NextResponse.json({ rezervasyonSayisi });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
    const kamp = await db.camp.update({
      where: { id: params.id },
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
      aksiyon: "guncelle",
      kaynakEtiketi: kamp.ad,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, kamp });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Kamp güncellenemedi" }, { status: 500 });
  }
}

// Kamp silinince ilişkili CampReservation kayıtları CASCADE ile silinir;
// onlara bağlı Payment satırları ise SetNull ile hayatta kalır — finansal
// kayıt korunur (bkz. prisma/schema.prisma > Payment.campReservationId notu).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const silinen = await db.camp.delete({ where: { id: params.id } });
  await logKaydet({
    seviye: "INFO",
    kategori: "kamp",
    aksiyon: "sil",
    kaynakEtiketi: silinen.ad,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
