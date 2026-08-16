import { db } from "@/lib/db";

// Mood'lar artık admin panelinden yönetiliyor (bkz. app/admin/moods) —
// eskiden burada sabit kodlu bir liste vardı. Bu dosya artık yalnızca
// sunucu tarafında DB'den okuma yardımcısı barındırıyor; istemci
// bileşenleri (ör. app/(site)/courses/KursKatalogu.tsx,
// app/admin/courses/[id]/edit/DersYonetimi.tsx) etiket listesini prop
// olarak bir sunucu bileşeninden alır, kendileri DB'ye erişmez.
export function moodlariAl() {
  return db.mood.findMany({ orderBy: { sira: "asc" } });
}
