import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { uygulamaSurumunuAl } from "@/lib/gitUpdate";
import { ToastProvider } from "@/components/Toast";
import Providers from "@/components/Providers";
import { fontDegiskenleri } from "@/lib/fonts";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "../globals.css";

export const dynamic = "force-dynamic";

// Önceden HİÇBİR admin sayfasının <title>'ı yoktu (tarayıcı sekmesi boş
// görünüyordu) — bu, tüm /admin/** için bir varsayılan sağlıyor. Alt
// sayfalar isterse kendi "metadata.title"ını export ederek "%s — LucidMove
// Yönetim" şablonunu doldurabilir (şu an hiçbiri etmiyor, hepsi varsayılanı
// kullanıyor). Admin herkese açık aranabilirlikte yer almamalı — noindex.
export const metadata: Metadata = {
  title: { default: "LucidMove Yönetim", template: "%s — LucidMove Yönetim" },
  robots: { index: false, follow: false },
};

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
              <AdminSidebar
                surum={surum}
                userEmail={session.user?.email || ""}
                guncellemeErisimiVar={sayfaErisimiVarMi(session, "/admin/settings/updates")}
                sistemYoneticisiMi={session.sistemYoneticisiMi}
                izinliSayfalar={session.izinliSayfalar}
              />

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
