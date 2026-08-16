import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Tek middleware, iki bağımsız görev: /admin/** için oturum koruması (admin
// panel hiçbir zaman locale öneki almıyor, her zaman Türkçe); geri kalan her
// yol için next-intl'in locale algılama/yönlendirmesi. Admin dalı, önceki
// (yalnızca-admin) middleware'in birebir aynısı — yalnızca bir dala ayrıldı.
export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
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

  return intlMiddleware(req);
}

export const config = {
  // /admin/** (yukarıda ayrı ele alınıyor), /api/**, Next dahili yolları ve
  // statik dosyalar (uzantılı yollar) hariç her şey — hem admin koruması hem
  // next-intl bu tek matcher üzerinden çalışıyor.
  matcher: ["/((?!api|admin|_next|_vercel|uploads|.*\\..*).*)", "/admin/:path*"],
};
