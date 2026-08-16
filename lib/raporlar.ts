import { db } from "@/lib/db";

// Panel'deki "İzlenme" kartı ve Raporlar > İzlenmeler sayfası aynı sayımı
// kullanıyor — tek yerden (bkz. app/api/membership/watch > LessonProgress).
// araligi verilirse (bkz. lib/ayFiltresi.ts) yalnızca o dönemde TAMAMLANAN
// (updatedAt) dersler sayılır; verilmezse tüm zamanlar.
export async function toplamIzlenmeSayisiniAl(araligi?: { gte: Date; lt: Date } | null): Promise<number> {
  return db.lessonProgress.count({ where: { tamamlandi: true, ...(araligi ? { updatedAt: araligi } : {}) } });
}
