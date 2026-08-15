import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";
import { sayfaErisimiVarMi } from "@/lib/adminYetki";
import { adminNavGruplariniAl, AYARLAR_OGELERI } from "@/app/admin/admin-nav-data";

// Yalnızca gerçekten var olan admin sayfaları seçilebilir (içerik VE Ayarlar) —
// istemciden gelen keyfi bir href listesine güvenmiyoruz.
function gecerliSayfaHrefleri(): string[] {
  return [...adminNavGruplariniAl().flatMap((g) => g.ogeler.map((o) => o.href)), ...AYARLAR_OGELERI.map((o) => o.href)];
}

const rolSemasi = z.object({
  ad: z.string().min(2).max(100),
  sayfalar: z.array(z.string()),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  // "Roller" sayfası artık özel role da devredilebiliyor — ama devredilen kişi
  // (sistemYoneticisiMi değilse) yalnızca KENDİ erişebildiği sayfalardan oluşan
  // bir rol oluşturabilir. Aksi halde "Roller" yetkisi, kendi sayfa kümesinin
  // dışına çıkıp daha geniş bir rol icat edip (ör. Kullanıcılar + Roller içeren)
  // kendine/bir başkasına atayarak yetki yükseltmenin (privilege escalation)
  // yolu olurdu.
  if (!session || !sayfaErisimiVarMi(session, "/admin/settings/roles")) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const govde = rolSemasi.safeParse(await req.json());
  if (!govde.success) {
    return NextResponse.json({ hata: "Geçersiz form verisi" }, { status: 400 });
  }

  const gecerli = new Set(gecerliSayfaHrefleri());
  let sayfalar = govde.data.sayfalar.filter((s) => gecerli.has(s));
  if (!session.sistemYoneticisiMi) {
    const kendiSayfalari = new Set(session.izinliSayfalar ?? []);
    sayfalar = sayfalar.filter((s) => kendiSayfalari.has(s));
  }

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
