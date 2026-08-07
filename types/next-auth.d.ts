import "next-auth";
import "next-auth/jwt";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      // Sadece hızlı UI ön-filtresi için — asıl yetki kontrolü her zaman DB'den
      // canlı okunur (bkz. app/admin/layout.tsx ve app/api/admin/** route'ları).
      role?: Role;
      // Sadece navbar avatarı için — profil fotoğrafı değiştiğinde bir
      // sonraki girişe kadar bayat kalabilir (kritik değil, kozmetik).
      profilFotoUrl?: string | null;
    };
  }

  interface User {
    role?: Role;
    profilFotoUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: Role;
    profilFotoUrl?: string | null;
  }
}
