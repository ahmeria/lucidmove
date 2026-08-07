import { db } from "@/lib/db";

export async function aktifUyelikVarMi(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;

  // İptal edilmiş bir üyelik de, dönem sonuna kadar erişim hakkı taşır —
  // bu yüzden hem AKTIF hem de henüz süresi dolmamış İPTAL_EDILDI kayıtlarını
  // "erişilebilir" sayıyoruz.
  const abonelik = await db.subscription.findFirst({
    where: {
      userId,
      status: { in: ["AKTIF", "IPTAL_EDILDI"] },
      currentPeriodEnd: { gt: new Date() },
    },
  });

  return !!abonelik;
}

export async function guncelUyelik(userId: string | undefined) {
  if (!userId) return null;

  return db.subscription.findFirst({
    where: { userId, status: { in: ["AKTIF", "IPTAL_EDILDI"] } },
    orderBy: { createdAt: "desc" },
  });
}
