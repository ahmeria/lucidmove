import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";
import { hizSiniriniKontrolEt } from "@/lib/rateLimit";

const GIRIS_DENEME_LIMITI = 8;
const GIRIS_DENEME_PENCERESI_MS = 5 * 60 * 1000; // 5 dakika

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/giris",
  },
  providers: [
    CredentialsProvider({
      name: "E-posta ve Şifre",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase();

        // E-posta başına kaba kuvvet koruması — aşılırsa şifre kontrolüne hiç
        // girmeden reddedilir (bkz. lib/rateLimit.ts).
        const izinVar = hizSiniriniKontrolEt(`login:${email}`, GIRIS_DENEME_LIMITI, GIRIS_DENEME_PENCERESI_MS);
        if (!izinVar) {
          await logKaydet({
            seviye: "ERROR",
            kategori: "auth",
            aksiyon: "login_basarisiz",
            kullaniciEtiketi: email,
            mesaj: "Çok fazla deneme — hız sınırına takıldı",
          });
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
          await logKaydet({ seviye: "ERROR", kategori: "auth", aksiyon: "login_basarisiz", kullaniciEtiketi: email });
          return null;
        }

        const gecerliMi = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!gecerliMi) {
          await logKaydet({
            seviye: "ERROR",
            kategori: "auth",
            aksiyon: "login_basarisiz",
            userId: user.id,
            kullaniciEtiketi: email,
          });
          return null;
        }

        await logKaydet({ seviye: "INFO", kategori: "auth", aksiyon: "login", userId: user.id, kullaniciEtiketi: email });
        return { id: user.id, name: user.ad, email: user.email, role: user.role, profilFotoUrl: user.profilFotoUrl };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.profilFotoUrl = user.profilFotoUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.profilFotoUrl = token.profilFotoUrl;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
