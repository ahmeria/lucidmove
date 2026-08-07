import { db } from "@/lib/db";

// Panel'deki "Toplam izlenme" kartı ve Raporlar > İzlenmeler sayfası aynı
// sayımı kullanıyor — tek yerden (bkz. app/api/uyelik/izlenme > LessonProgress).
export async function toplamIzlenmeSayisiniAl(): Promise<number> {
  return db.lessonProgress.count({ where: { tamamlandi: true } });
}
