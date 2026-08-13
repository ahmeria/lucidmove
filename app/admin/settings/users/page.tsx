import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Kart, { StatKart } from "@/components/admin/Kart";
import SayfaBasligi from "@/components/admin/SayfaBasligi";
import { UyeIkonu } from "@/components/admin/StatIkonlari";
import AyarlarSekmeleri from "../AyarlarSekmeleri";
import KullaniciSilButonu from "./KullaniciSilButonu";

export const dynamic = "force-dynamic";

const ROL_ETIKETI: Record<string, string> = { UYE: "Üye", ADMIN: "Admin" };

function uyelikRozetiniAl(abonelik: { status: string; currentPeriodEnd: Date } | undefined) {
  if (!abonelik) return { metin: "Üyeliksiz", sinif: "bg-metin/10 text-metin/50" };
  if (abonelik.currentPeriodEnd <= new Date()) return { metin: "Süresi doldu", sinif: "bg-metin/10 text-metin/50" };
  if (abonelik.status === "IPTAL_EDILDI") return { metin: "İptal edildi", sinif: "bg-amber-100 text-amber-800" };
  return { metin: "Aktif", sinif: "bg-emerald-100 text-emerald-800" };
}

export default async function AdminKullanicilar() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) notFound();

  // Üye (UYE) rolündeki hesaplar artık burada değil — onlar için bkz.
  // /admin/members. Burası yalnızca admin erişimi olan hesapları yönetir.
  const kullanicilar = await db.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    include: {
      subscriptions: {
        where: { status: { in: ["AKTIF", "IPTAL_EDILDI"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const sistemYoneticisiSayisi = kullanicilar.filter((k) => k.sistemYoneticisiMi).length;

  return (
    <div>
      <SayfaBasligi
        sag={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/settings/users/new"
              className="bg-metin text-zemin px-5 py-2.5 rounded-lg font-body text-sm hover:bg-koyu transition-colors cursor-pointer whitespace-nowrap"
            >
              Yeni kullanıcı
            </Link>
            <AyarlarSekmeleri />
          </div>
        }
      />

      <div className="mb-6 max-w-xs">
        <StatKart etiket="Toplam admin" deger={kullanicilar.length} renk="vurgu" ikon={UyeIkonu} />
      </div>

      <Kart dolgu={false} className="overflow-x-auto">
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="bg-zemin border-b border-cizgi text-metin/50 text-xs uppercase tracking-wide">
              <th className="px-5 py-3">Ad</th>
              <th className="px-5 py-3">İletişim</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Üyelik</th>
              <th className="px-5 py-3">Kayıt</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {kullanicilar.map((k) => {
              const rozet = uyelikRozetiniAl(k.subscriptions[0]);
              return (
                <tr key={k.id} className="border-b border-cizgi last:border-0 hover:bg-zemin/60 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-metin font-medium">{k.ad}</p>
                    {k.sistemYoneticisiMi && (
                      <span className="font-mono text-[10px] uppercase tracking-wide text-vurgu-dark">
                        Sistem yöneticisi
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-metin/60">
                    <p>{k.email}</p>
                    {k.telefon && <p className="text-xs text-metin/45">{k.telefon}</p>}
                  </td>
                  <td className="px-5 py-3 text-metin/60">{ROL_ETIKETI[k.role] ?? k.role}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${rozet.sinif}`}>
                      {rozet.metin}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-metin/60">
                    {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(k.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right space-x-4 whitespace-nowrap">
                    <Link
                      href={`/admin/settings/users/${k.id}/edit`}
                      className="text-vurgu hover:text-vurgu-dark"
                    >
                      Düzenle
                    </Link>
                    <KullaniciSilButonu
                      kullaniciId={k.id}
                      kullaniciAdi={k.ad}
                      kendisiMi={k.id === session.user?.id}
                      tekSistemYoneticisiMi={k.sistemYoneticisiMi && sistemYoneticisiSayisi <= 1}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Kart>
    </div>
  );
}
