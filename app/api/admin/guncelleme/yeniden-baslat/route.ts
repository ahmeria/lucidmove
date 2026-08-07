import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { otomatikYenidenBaslatilabilirMi, yenidenBaslat } from "@/lib/gitUpdate";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  if (!otomatikYenidenBaslatilabilirMi()) {
    return NextResponse.json({ hata: "Bu ortamda otomatik yeniden başlatma desteklenmiyor (pm2 algılanmadı)" }, { status: 400 });
  }

  // Yanıt önce tamamen istemciye gönderilsin diye restart komutu kısa bir
  // gecikmeyle tetiklenir — aksi halde pm2 bu process'i yanıt akışı tam
  // yazılmadan sonlandırabilir.
  setTimeout(() => {
    try {
      yenidenBaslat();
    } catch {
      // Bu process zaten kapanmak üzere; hata burada raporlanamaz, yut.
    }
  }, 300);

  return NextResponse.json({ basarili: true, mesaj: "Yeniden başlatma tetiklendi." });
}
