// Bir admin oturumunun belirli bir /admin/** sayfasına erişimi olup olmadığını
// belirler. Ayarlar bölümü (Kullanıcılar, Roller, Cache, Yedekleme, Sistem
// Logları, Entegrasyon, Güncelleme, Genel Ayarlar) bilerek bu mekanizmanın
// dışında tutuldu — hassas işlemler yalnızca sistemYoneticisiMi ile açılır,
// özel bir role yanlışlıkla bu yetkiler verilemez (bkz. lib/admin-auth.ts).
export interface AdminYetkiSinyalleri {
  sistemYoneticisiMi: boolean;
  // null: özel bir role atanmamış — sistemYoneticisiMi hariç eski/varsayılan
  // admin davranışı (Ayarlar dışındaki tüm sayfalara erişim). Dizi: yalnızca
  // listedeki (veya alt yolu eşleşen) sayfalara erişim.
  izinliSayfalar: string[] | null;
}

export function ayarlarSayfasiMi(pathname: string): boolean {
  return pathname.startsWith("/admin/ayarlar");
}

export function sayfaErisimiVarMi(session: AdminYetkiSinyalleri, pathname: string): boolean {
  if (session.sistemYoneticisiMi) return true;
  if (pathname === "/admin") return true;
  if (ayarlarSayfasiMi(pathname)) return false;
  if (session.izinliSayfalar === null) return true;
  return session.izinliSayfalar.some((href) => pathname === href || pathname.startsWith(`${href}/`));
}
