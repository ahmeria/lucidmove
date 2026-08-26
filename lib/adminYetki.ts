// Bir admin oturumunun belirli bir /admin/** sayfasına erişimi olup olmadığını
// belirler. Ayarlar bölümü (Kullanıcılar, Roller, Cache, Yedekleme, Sistem
// Logları, Entegrasyon, Güncelleme, Genel Ayarlar, Sayfa Tasarımı) artık özel
// rollerle SAYFA BAZINDA devredilebilir — tıpkı içerik sayfaları gibi (bkz.
// app/admin/settings/roles). Yalnızca özel bir role AÇIKÇA atanmış (izinliSayfalar
// dizisinde listelenmiş) Ayarlar sayfalarına erişim açılır; rol atanmamış
// (eski/varsayılan) admin hesapları hâlâ Ayarlar'ın tamamının dışında kalır —
// bu, mevcut hesapların davranışını sessizce değiştirmemek için bilinçli.
//
// "Kullanıcılar" ve "Roller" sayfaları özel bir dikkat gerektirir: bunlara
// erişim verilmesi, o kişinin başka admin hesapları/roller üzerinde etki
// alanı kazanması demektir. Bu yüzden ilgili API route'ları (bkz.
// app/api/admin/users, app/api/admin/roles) sistemYoneticisiMi bayrağını
// yükseltme/devretme ve kendi sayfa kümesinden daha geniş bir rol
// oluşturma/atama gibi asıl yükseltme (privilege escalation) yollarını ayrıca
// engeller — sayfa erişimi tek başına bu riskleri kapatmaz.
export interface AdminYetkiSinyalleri {
  sistemYoneticisiMi: boolean;
  // null: özel bir role atanmamış — sistemYoneticisiMi hariç eski/varsayılan
  // admin davranışı (Ayarlar dışındaki tüm sayfalara erişim). Dizi: yalnızca
  // listedeki (veya alt yolu eşleşen) sayfalara erişim — Ayarlar sayfaları da
  // dahil, listede açıkça yer alıyorsa.
  izinliSayfalar: string[] | null;
}

export function ayarlarSayfasiMi(pathname: string): boolean {
  return pathname.startsWith("/admin/settings");
}

// Bir rolün sayfa kümesi, çağıranın kendi sayfa kümesinin bir alt kümesi mi?
// "Kullanıcılar" veya "Roller" yetkisi olan (ama sistemYoneticisiMi olmayan)
// bir admin, kendi erişemediği sayfaları içeren bir rol oluşturup/atayarak
// dolaylı yetki yükseltmesi yapamasın diye kullanılıyor (bkz.
// app/api/admin/users, app/api/admin/roles).
export function rolKendiErisimindeMi(cagiranIzinliSayfalar: string[], rolSayfalari: string[]): boolean {
  const izinli = new Set(cagiranIzinliSayfalar);
  return rolSayfalari.every((s) => izinli.has(s));
}

export function sayfaErisimiVarMi(session: AdminYetkiSinyalleri, pathname: string): boolean {
  if (session.sistemYoneticisiMi) return true;
  if (pathname === "/admin") return true;
  if (session.izinliSayfalar === null) {
    // Rol atanmamış varsayılan admin: eski davranış aynen korunuyor —
    // Ayarlar hariç tüm içerik sayfalarına erişir.
    return !ayarlarSayfasiMi(pathname);
  }
  // Özel rol atanmışsa: Ayarlar dahil, yalnızca listede AÇIKÇA verilen
  // sayfalara erişir.
  return session.izinliSayfalar.some((href) => {
    if (pathname === href) return true;
    // GÜVENLİK: "/admin" (Panel) ve "/admin/settings" (Genel Ayarlar) her
    // ikisi de BAŞKA sayfaların da ortak URL ön eki — bu yüzden BİLEREK
    // prefix eşleşmesine dahil edilmiyor. "/admin" zaten yukarıdaki
    // `pathname === "/admin"` satırıyla herkese koşulsuz açık; eğer bir
    // rolün listesinde yer alıp buradaki prefix kontrolüne dahil edilseydi,
    // `pathname.startsWith("/admin/")` HER admin alt yoluyla eşleşir —
    // yalnızca Panel'e erişim vermek isteyen bir admin, Kullanıcılar/
    // Roller/Yedekleme/Sistem Logları/Güncelleme gibi hiç açıkça
    // verilmemiş Ayarlar sayfaları dahil TÜM panele sessiz bir joker
    // karakterle erişmiş olurdu (gerçek üretim rolünde bulunan bir hata).
    // "/admin/settings" için de aynı gerekçe: yalnızca Genel Ayarlar
    // verilen biri, salt URL yapısı yüzünden yanlışlıkla TÜM Ayarlar
    // sayfalarına (Kullanıcılar, Roller dahil) erişmiş olurdu. Diğer Ayarlar
    // sayfaları (ör. "/admin/settings/users") kendi alt yollarını
    // (new/[id]/edit) kapsaması için prefix eşleşmesini korur.
    if (href === "/admin" || href === "/admin/settings") return false;
    return pathname.startsWith(`${href}/`);
  });
}
