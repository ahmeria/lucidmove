import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfilForm from "../ProfilForm";

export const dynamic = "force-dynamic";

export default async function HesabimProfil() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?returnTo=/account/profile");
  if (session.user.role === "ADMIN") redirect("/admin");

  const kullanici = await db.user.findUnique({
    where: { id: session.user.id },
    select: { ad: true, email: true, telefon: true, profilFotoUrl: true },
  });
  if (!kullanici) redirect("/login?returnTo=/account/profile");

  return (
    <div className="container-nefes py-20 max-w-xl">
      <Link href="/account" className="font-body text-sm text-metin/60 hover:text-metin transition-colors">
        ← Panele dön
      </Link>

      <p className="font-mono text-xs tracking-[0.3em] uppercase text-vurgu-dark mt-6 mb-4">Profil Ayarları</p>
      <h1 className="font-display text-3xl font-bold text-metin leading-tight mb-8">Bilgilerinizi düzenleyin</h1>

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
