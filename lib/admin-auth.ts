import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";

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

  // sistemYoneticisiMi: /admin/settings/** bölümüne (Genel Ayarlar, Kullanıcılar,
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

// GÜVENLİK: getAdminSession() tek başına yalnızca "bu kişi bir admin mi"
// sorusuna cevap verir — sayfa bazlı kısıtlamayı (özel rol atanmış bir
// hesabın YALNIZCA belirli sayfalara erişebilmesi, bkz. lib/adminYetki.ts)
// KONTROL ETMEZ, çağıranın bunu ayrıca yapmasını bekler. Bir güvenlik
// incelemesinde admin API route'larının çoğunun bunu unuttuğu, yani özel/
// kısıtlı rollü bir admin hesabının (ör. yalnızca "Moodlar" sayfası verilmiş
// biri) ilgili sayfaya UI'da erişemese bile o sayfanın API uçlarını doğrudan
// çağırarak (ör. /api/admin/settings, /api/admin/members) veri okuyup/
// yazabildiği ortaya çıktı. Bu yardımcı, ikisini TEK ÇAĞRIDA birleştirir —
// yeni bir route bunu unutmasın diye.
export async function sayfaYetkisiOlanOturum(sayfa: string) {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, sayfa)) return null;
  return session;
}
