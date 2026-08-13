import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { logKaydet } from "@/lib/systemLog";

// LucidMove'da Redis vb. ayrı bir önbellek katmanı yok — "cache" burada Next.js'in
// sayfa/veri önbelleğini (route cache) ifade eder. Admin bir kayıt değiştirdiğinde
// ilgili sayfalar zaten kendi API route'larında router.refresh() ile tazeleniyor;
// bu buton daha çok "her ihtimale karşı anasayfa/kurs sayfalarını zorla tazele"
// amaçlı manuel bir güvenlik supabı.
export async function POST() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  revalidatePath("/", "layout");
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/courses/[slug]/[lessonSlug]", "page");

  await logKaydet({
    seviye: "INFO",
    kategori: "cache",
    aksiyon: "temizle",
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });

  return NextResponse.json({ basarili: true });
}
