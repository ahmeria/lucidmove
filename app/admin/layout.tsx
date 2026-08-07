import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { ToastProvider } from "@/components/Toast";
import AdminNav from "./AdminNav";
import AdminHeader from "./AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/giris?sonra=/admin");

  return (
    <ToastProvider>
      <div className="min-h-screen grid lg:grid-cols-[248px_1fr] bg-zemin-acik">
        <aside className="bg-koyu lg:h-screen lg:sticky lg:top-0 p-6 flex flex-col">
          <Link href="/">
            <Image src="/logo.png" alt="lucidmove" width={754} height={147} className="h-6 w-auto brightness-0 invert" />
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zemin/45 mt-1 mb-8">Yönetim</p>

          <AdminNav />

          <div className="mt-auto pt-6 border-t border-zemin/10">
            <p className="font-body text-xs text-zemin/50 truncate">{session.user?.email}</p>
          </div>
        </aside>

        <div className="flex flex-col min-h-screen min-w-0">
          <AdminHeader
            userName={session.user?.name || session.user?.email || "Admin"}
            userEmail={session.user?.email || ""}
            sistemYoneticisiMi={session.sistemYoneticisiMi}
          />
          <main className="flex-1 p-6 sm:p-10">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
