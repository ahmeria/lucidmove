import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Hızlı ön-filtre — asıl yetki kontrolü app/admin/layout.tsx ve
// app/api/admin/** route'larında DB'den canlı okunur (JWT'deki role
// revoke sonrası bir süre bayat kalabilir, burada sadece UX yönlendirmesi yapılır).
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const girisUrl = new URL("/giris", req.url);
    girisUrl.searchParams.set("sonra", req.nextUrl.pathname);
    return NextResponse.redirect(girisUrl);
  }

  if (token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/hesabim", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
