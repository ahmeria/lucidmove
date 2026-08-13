import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const semasi = z.object({ dersId: z.string().min(1) });

// Bir ders videosu sonuna kadar izlendiğinde (bkz. components/VideoPlayer.tsx
// > onEnded) tetiklenir — LessonProgress'i "tamamlandı" olarak işaretler.
// Admin panel > Raporlar bu veriyi okur (bkz. lib/raporlar.ts).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ hata: "Giriş yapmalısınız" }, { status: 401 });

  const govde = semasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz veri" }, { status: 400 });
  }

  // Dersin gerçekten var olduğunu doğrula — rastgele bir id ile sahte kayıt açılmasın.
  const ders = await db.lesson.findUnique({ where: { id: govde.data.dersId }, select: { id: true } });
  if (!ders) return NextResponse.json({ hata: "Ders bulunamadı" }, { status: 404 });

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: ders.id } },
    update: { tamamlandi: true },
    create: { userId: session.user.id, lessonId: ders.id, tamamlandi: true },
  });

  return NextResponse.json({ basarili: true });
}
