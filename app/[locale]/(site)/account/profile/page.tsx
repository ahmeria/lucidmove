import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { AppLocale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import ProfilForm from "../ProfilForm";

export const dynamic = "force-dynamic";

export default async function HesabimProfil({ params }: { params: { locale: string } }) {
  const locale = params.locale as AppLocale;
  // Locale-doğru /login hedefi — bkz. app/[locale]/(site)/account/page.tsx.
  const girisHedefi = getPathname({
    href: { pathname: "/login", query: { returnTo: getPathname({ href: "/account/profile", locale }) } },
    locale,
  });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(girisHedefi);
  // Admin paneli locale ağacının tamamen dışında olduğu için burada
  // düz (locale'siz) next/navigation redirect'i kullanılır.
  if (session.user.role === "ADMIN") redirect("/admin");

  const [kullanici, t] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { ad: true, email: true, telefon: true, profilFotoUrl: true },
    }),
    getTranslations("profile"),
  ]);
  if (!kullanici) redirect(girisHedefi);

  return (
    <div className="container-nefes py-20 max-w-xl">
      <Link href="/account" className="font-body text-sm text-metin/60 hover:text-metin transition-colors">
        ← {t("paneleDon")}
      </Link>

      <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu-dark mt-6 mb-4">{t("profilAyarlari")}</p>
      <h1 className="font-display text-3xl font-bold text-metin leading-tight mb-8">{t("bilgileriniziDuzenleyin")}</h1>

      <section className="border border-cizgi rounded-[1.5rem] p-7 shadow-organik">
        <ProfilForm
          ad={kullanici.ad}
          email={kullanici.email}
          telefon={kullanici.telefon}
          profilFotoUrl={kullanici.profilFotoUrl}
        />
      </section>
    </div>
  );
}
