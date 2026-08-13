import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";

// Iyzico dışında (banka havalesi, elden vb.) alınan bir ödemeyi panelden elle
// kaydetmek için — üyeye doğrudan AKTİF bir abonelik + BAŞARILI bir ödeme
// kaydı açar. iyzicoPaymentId hep null kalır; tabloda bunun Iyzico değil
// manuel bir kayıt olduğunun işareti budur.
const semaFn = z.object({
  userId: z.string().min(1),
  plan: z.enum(["AYLIK", "YILLIK"]),
  tutar: z.coerce.number().positive(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = semaFn.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }
  const { userId, plan, tutar } = govde.data;

  const kullanici = await db.user.findUnique({ where: { id: userId } });
  if (!kullanici) return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 });

  const periyotSonu = new Date();
  if (plan === "AYLIK") periyotSonu.setMonth(periyotSonu.getMonth() + 1);
  else periyotSonu.setFullYear(periyotSonu.getFullYear() + 1);

  // Aynı kullanıcının önceden aktif bir aboneliği varsa, iki aktif kayıt aynı
  // anda görünmesin diye eskisi iptal edilir.
  await db.subscription.updateMany({
    where: { userId, status: "AKTIF" },
    data: { status: "IPTAL_EDILDI", cancelledAt: new Date() },
  });

  const abonelik = await db.subscription.create({
    data: { userId, plan, status: "AKTIF", currentPeriodEnd: periyotSonu },
  });
  await db.payment.create({
    data: { userId, subscriptionId: abonelik.id, tutar, durum: "BASARILI" },
  });

  await logKaydet({
    seviye: "INFO",
    kategori: "uyelik",
    aksiyon: "olustur",
    kaynakEtiketi: kullanici.email,
    mesaj: `Manuel ödeme: ${plan === "AYLIK" ? "Aylık" : "Yıllık"} — ₺${tutar}`,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
