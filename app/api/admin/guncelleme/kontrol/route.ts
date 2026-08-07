import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { guncellemeKontrolEt } from "@/lib/gitUpdate";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session?.sistemYoneticisiMi) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  try {
    const sonuc = await guncellemeKontrolEt();
    return NextResponse.json(sonuc);
  } catch (err) {
    return NextResponse.json({ hata: err instanceof Error ? err.message : "Kontrol başarısız" }, { status: 500 });
  }
}
