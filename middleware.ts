import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Hızlı ön-filtre — asıl yetki kontrolü app/admin/layout.tsx ve
// app/api/admin/** route'larında DB'den canlı okunur (JWT'deki role
// revoke sonrası bir süre bayat kalabilir, burada sadece UX yönlendirmesi yapılır).
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const girisUrl = new URL("/login", req.url);
    girisUrl.searchParams.set("returnTo", req.nextUrl.pathname);
    return NextResponse.redirect(girisUrl);
  }

  if (token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  // app/admin/layout.tsx Server Component'inde pathname'e doğrudan erişim
  // yok — sayfa bazlı yetki kontrolü (bkz. lib/adminYetki.ts) için isteğin
  // yolunu bir header'da taşıyoruz.
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
