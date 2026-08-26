import { db } from "@/lib/db";
import type { PrivateLesson } from "@prisma/client";

// Özel Dersler'in kapasite/expiry karşılığı yok — dijital içerikte kıtlık
// veya tarih kısıtı olmadığından bu dosya lib/kamplar.ts'e göre çok daha
// küçük: tek bir soru var, "bu kullanıcı bu özel dersi satın aldı mı?".

// aktifUyelikVarMi'nin (lib/uyelik.ts) tekil-ürün karşılığı — üyelik
// durumundan tamamen bağımsız, yalnızca bu ikili için bir ODENDI kaydı var mı.
export async function ozelDersSatinAlindiMi(
  userId: string | undefined,
  privateLessonId: string
): Promise<boolean> {
  if (!userId) return false;
  const satinAlma = await db.privateLessonPurchase.findUnique({
    where: { privateLessonId_userId: { privateLessonId, userId } },
  });
  return satinAlma?.status === "ODENDI";
}

export interface YayindakiOzelDers extends PrivateLesson {
  videoSayisi: number;
  toplamDakika: number;
}

// Anasayfada gösterilecek, yayında olan özel dersleri video sayısı + toplam
// süreleriyle birlikte döner. Boş dizi = anasayfada bu bölüm hiç görünmez.
export async function yayindakiOzelDersleriGetir(): Promise<YayindakiOzelDers[]> {
  const dersler = await db.privateLesson.findMany({
    where: { yayindaMi: true },
    orderBy: { sira: "asc" },
  });
  if (dersler.length === 0) return [];

  const gruplar = await db.privateLessonVideo.groupBy({
    by: ["privateLessonId"],
    where: { privateLessonId: { in: dersler.map((d) => d.id) } },
    _count: { _all: true },
    _sum: { sureDakika: true },
  });
  const ozet = new Map(gruplar.map((g) => [g.privateLessonId, { adet: g._count._all, dakika: g._sum.sureDakika ?? 0 }]));

  return dersler.map((d) => ({
    ...d,
    videoSayisi: ozet.get(d.id)?.adet ?? 0,
    toplamDakika: ozet.get(d.id)?.dakika ?? 0,
  }));
}

// lib/dersler.ts > derslerinSirasiniYenile'nin birebir kopyası, PrivateLessonVideo
// hedefli — admin'in girdiği çakışan/boşluklu sira değerlerinin public
// sıralamayı bozmasını önler.
export async function ozelDersVideolarininSirasiniYenile(privateLessonId: string) {
  const videolar = await db.privateLessonVideo.findMany({
    where: { privateLessonId },
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  await db.$transaction(
    videolar.map((v, i) => db.privateLessonVideo.update({ where: { id: v.id }, data: { sira: i + 1 } }))
  );
}
