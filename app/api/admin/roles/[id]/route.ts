import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";
import { adminNavGruplariniAl } from "@/app/admin/admin-nav-data";

function gecerliSayfaHrefleri(): string[] {
  return adminNavGruplariniAl().flatMap((g) => g.ogeler.map((o) => o.href));
}

const rolSemasi = z.object({
  ad: z.string().min(2).max(100),
  sayfalar: z.array(z.string()),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = rolSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const gecerli = new Set(gecerliSayfaHrefleri());
  const sayfalar = govde.data.sayfalar.filter((s) => gecerli.has(s));

  try {
    const rol = await db.adminRole.update({
      where: { id: params.id },
      data: { ad: govde.data.ad, sayfalar },
    });
    await logKaydet({
      seviye: "INFO",
      kategori: "rol",
      aksiyon: "guncelle",
      kaynakEtiketi: rol.ad,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu rol adı zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Rol güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  // Bu role atanmış kullanıcılar silindiğinde otomatik olarak "role atanmamış"
  // (eski/varsayılan admin erişimi) durumuna döner — onDelete: SetNull.
  const silinen = await db.adminRole.delete({ where: { id: params.id } });
  await logKaydet({
    seviye: "INFO",
    kategori: "rol",
    aksiyon: "sil",
    kaynakEtiketi: silinen.ad,
    userId: session.user?.id,
    kullaniciEtiketi: session.user?.email,
  });
  return NextResponse.json({ basarili: true });
}
