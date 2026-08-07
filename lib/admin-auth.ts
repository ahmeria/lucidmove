import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Asıl yetki kapısı — session'daki role'e güvenmez, DB'den canlı okur.
// middleware.ts sadece hızlı UX ön-filtresi; gerçek kontrol her zaman burada.
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const kullanici = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, sistemYoneticisiMi: true, adminRole: { select: { sayfalar: true } } },
  });
  if (kullanici?.role !== "ADMIN") return null;

  // sistemYoneticisiMi: /admin/ayarlar/** bölümüne (Genel Ayarlar, Kullanıcılar,
  // Roller, Cache, Yedekleme, Sistem Logları) erişim yetkisi — her admin değil,
  // yalnızca bu işaretli hesap(lar) görebilir/girebilir. izinliSayfalar: özel
  // role atanmışsa sayfa bazında kısıtlama (bkz. lib/adminYetki.ts) — atanmamışsa
  // null, yani Ayarlar dışındaki tüm sayfalara eski/varsayılan erişim.
  return {
    ...session,
    sistemYoneticisiMi: kullanici.sistemYoneticisiMi,
    izinliSayfalar: kullanici.adminRole ? (kullanici.adminRole.sayfalar as string[]) : null,
  };
}
