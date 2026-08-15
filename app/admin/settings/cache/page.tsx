import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { db } from "@/lib/db";
import Kart from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import CacheTemizleButonu from "./CacheTemizleButonu";

export const dynamic = "force-dynamic";

export default async function AdminCache() {
  const session = await getAdminSession();
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/cache")) notFound();

  const sonTemizleme = await db.systemLog.findFirst({
    where: { kategori: "cache", aksiyon: "temizle" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <SayfaBasligi
        sag={<AyarlarSekmeleri sistemYoneticisiMi={session.sistemYoneticisiMi} izinliSayfalar={session.izinliSayfalar} />}
      />

      <p className="font-body text-sm text-metin/60 mb-6 max-w-2xl">
        Anasayfa, kurs ve ders sayfalarının önbelleğini elle tazeler. Normalde içerik değişiklikleri (kurs/ders/kategori
        düzenleme) ilgili sayfayı zaten otomatik tazeler — bu buton yalnızca beklenmedik bir tutarsızlık durumunda
        güvenlik supabı olarak kullanılır.
      </p>

      <Kart>
        <p className="font-body text-sm text-metin/70 mb-4">
          {sonTemizleme ? (
            <>
              Son temizlenme:{" "}
              <span className="text-metin font-medium">
                {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(sonTemizleme.createdAt)}
              </span>{" "}
              — {sonTemizleme.kullaniciEtiketi ?? "bilinmiyor"}
            </>
          ) : (
            "Henüz manuel bir önbellek temizleme yapılmadı."
          )}
        </p>
        <CacheTemizleButonu />
      </Kart>
    </div>
  );
}
