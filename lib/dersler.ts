import { db } from "@/lib/db";

// Bir kursun derslerini sira/createdAt'e göre sıralayıp 1..N olarak
// yeniden numaralandırır — admin'in girdiği çakışan/boşluklu sira
// değerlerinin public sıralamayı bozmasını önler.
export async function derslerinSirasiniYenile(courseId: string) {
  const dersler = await db.lesson.findMany({
    where: { courseId },
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  await db.$transaction(
    dersler.map((d, i) => db.lesson.update({ where: { id: d.id }, data: { sira: i + 1 } }))
  );
}
