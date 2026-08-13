import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";
import { adminNavGruplariniAl } from "@/app/admin/admin-nav-data";

// Yalnızca gerçekten var olan, Ayarlar dışı admin sayfaları seçilebilir —
// istemciden gelen keyfi bir href listesine güvenmiyoruz (bkz. lib/adminYetki.ts
// > Ayarlar bilerek bu mekanizmanın tamamen dışında).
function gecerliSayfaHrefleri(): string[] {
  return adminNavGruplariniAl().flatMap((g) => g.ogeler.map((o) => o.href));
}

const rolSemasi = z.object({
  ad: z.string().min(2).max(100),
  sayfalar: z.array(z.string()),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const govde = rolSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const gecerli = new Set(gecerliSayfaHrefleri());
  const sayfalar = govde.data.sayfalar.filter((s) => gecerli.has(s));

  try {
    const rol = await db.adminRole.create({ data: { ad: govde.data.ad, sayfalar } });
    await logKaydet({
      seviye: "INFO",
      kategori: "rol",
      aksiyon: "olustur",
      kaynakEtiketi: rol.ad,
      userId: session.user?.id,
      kullaniciEtiketi: session.user?.email,
    });
    return NextResponse.json({ basarili: true, rol });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ hata: "Bu rol adı zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ hata: "Rol oluşturulamadı" }, { status: 500 });
  }
}
