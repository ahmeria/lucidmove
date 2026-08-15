import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { guncellemeUygula, type GuncellemeOlayi } from "@/lib/gitUpdate";
import { logKaydet } from "@/lib/systemLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Aynı anda birden fazla güncelleme çalışmasın diye process içinde basit bir
// kilit — tek instance Node process varsayımıyla yeterli (bkz. lib/backup.ts'teki
// aynı desen).
let guncellemeSuruyor = false;

function satirDondur(olay: GuncellemeOlayi, durum: number): Response {
  return new Response(JSON.stringify(olay) + "\n", {
    status: durum,
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}

export async function POST() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/updates")) {
    return satirDondur({ tur: "tamam", basarili: false, mesaj: "Yetkisiz" }, 403);
  }
  if (guncellemeSuruyor) {
    return satirDondur({ tur: "tamam", basarili: false, mesaj: "Zaten devam eden bir güncelleme var" }, 409);
  }

  guncellemeSuruyor = true;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const yayinla = (olay: GuncellemeOlayi) => {
        controller.enqueue(encoder.encode(JSON.stringify(olay) + "\n"));
      };
      let basariliMi = false;
      try {
        await guncellemeUygula((olay) => {
          if (olay.tur === "tamam") basariliMi = olay.basarili;
          yayinla(olay);
        });
      } catch (err) {
        yayinla({ tur: "tamam", basarili: false, mesaj: err instanceof Error ? err.message : "server_error" });
      } finally {
        guncellemeSuruyor = false;
        controller.close();
        await logKaydet({
          seviye: basariliMi ? "INFO" : "ERROR",
          kategori: "guncelleme",
          aksiyon: basariliMi ? "guncelle" : "hata",
          userId: session.user?.id,
          kullaniciEtiketi: session.user?.email,
        });
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
  });
}
