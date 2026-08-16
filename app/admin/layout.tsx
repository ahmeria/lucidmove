import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { uygulamaSurumunuAl } from "@/lib/gitUpdate";
import { ToastProvider } from "@/components/Toast";
import Providers from "@/components/Providers";
import { fontDegiskenleri } from "@/lib/fonts";
import AdminNav from "./AdminNav";
import AdminHeader from "./AdminHeader";
import "../globals.css";

export const dynamic = "force-dynamic";

// Admin'in BAĞIMSIZ kök layout'u — kendi <html>/<body>'sini basıyor, site
// tarafındaki (app/[locale]/layout.tsx) locale routing'inin tamamen dışında.
// Admin panel hiçbir zaman bir locale önekine (/en, /az) girmiyor, her zaman
// Türkçe ve `lang="tr"` kalıyor — next-intl'in middleware'i de /admin/**'i
// hiç ele almıyor (bkz. middleware.ts).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/login?returnTo=/admin");

  // Sayfa bazlı erişim — özel role atanmış (sistemYoneticisiMi olmayan) bir
  // hesap, kendisine izin verilmemiş bir sayfaya doğrudan URL ile girmeye
  // çalışırsa Panel'e yönlendirilir (bkz. lib/adminYetki.ts).
  const pathname = headers().get("x-pathname") ?? "/admin";
  if (!sayfaErisimiVarMi(session, pathname)) redirect("/admin");

  const surum = uygulamaSurumunuAl();

  return (
    <html lang="tr" className={fontDegiskenleri}>
      <body className="font-body bg-zemin text-metin">
        <Providers>
          <ToastProvider>
            <div className="min-h-screen grid lg:grid-cols-[248px_1fr] bg-zemin-acik">
              <aside className="bg-koyu lg:h-screen lg:sticky lg:top-0 p-6 flex flex-col">
                <Link href="/">
                  <Image
                    src="/logo.png"
                    alt="lucidmove"
                    width={754}
                    height={147}
                    className="h-6 w-auto brightness-0 invert"
                  />
                </Link>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zemin/45 mt-1 mb-8">Yönetim</p>

                <AdminNav sistemYoneticisiMi={session.sistemYoneticisiMi} izinliSayfalar={session.izinliSayfalar} />

                <div className="mt-auto pt-6 border-t border-zemin/10 space-y-1.5">
                  <p className="font-body text-xs text-zemin/50 truncate">{session.user?.email}</p>
                  {sayfaErisimiVarMi(session, "/admin/settings/updates") ? (
                    <Link
                      href="/admin/settings/updates"
                      title="Güncellemeleri kontrol et"
                      className="font-mono text-[11px] text-zemin/35 hover:text-zemin/60 transition-colors"
                    >
                      {surum}
                    </Link>
                  ) : (
                    <p className="font-mono text-[11px] text-zemin/35">{surum}</p>
                  )}
                </div>
              </aside>

              <div className="flex flex-col min-h-screen min-w-0">
                <AdminHeader
                  userName={session.user?.name || session.user?.email || "Admin"}
                  userEmail={session.user?.email || ""}
                  sistemYoneticisiMi={session.sistemYoneticisiMi}
                  izinliSayfalar={session.izinliSayfalar}
                />
                <main className="flex-1 p-6 sm:p-10">{children}</main>
              </div>
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
