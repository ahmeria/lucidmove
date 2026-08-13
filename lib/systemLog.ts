import { db } from "@/lib/db";

interface LogKaydiGirdisi {
  seviye: "INFO" | "ERROR";
  kategori: string; // "auth" | "kategori" | "kurs" | "ders" | "kullanici" | "uyelik" | "cache" | "yorum" | "rol"
  aksiyon: string; // "login" | "login_basarisiz" | "olustur" | "guncelle" | "sil" | "temizle"
  kaynakEtiketi?: string;
  mesaj?: string;
  userId?: string | null;
  kullaniciEtiketi?: string | null;
}

// /admin/settings/logs sayfasında görüntülenen denetim günlüğüne bir kayıt ekler.
// Fire-and-forget çağrılır — loglama hiçbir zaman asıl işlemi (giriş, kayıt
// oluşturma vb.) engellememeli, bu yüzden hata burada yutulur ve konsola yazılır.
export async function logKaydet(girdi: LogKaydiGirdisi): Promise<void> {
  try {
    await db.systemLog.create({
      data: {
        seviye: girdi.seviye,
        kategori: girdi.kategori,
        aksiyon: girdi.aksiyon,
        kaynakEtiketi: girdi.kaynakEtiketi,
        mesaj: girdi.mesaj,
        userId: girdi.userId ?? null,
        kullaniciEtiketi: girdi.kullaniciEtiketi ?? null,
      },
    });
  } catch (err) {
    console.error("Sistem log kaydı başarısız:", err);
  }
}
