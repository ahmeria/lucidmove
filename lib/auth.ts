import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { logKaydet } from "@/lib/systemLog";
import { hizSiniriniKontrolEt } from "@/lib/rateLimit";

const GIRIS_DENEME_LIMITI = 8;
const GIRIS_DENEME_PENCERESI_MS = 5 * 60 * 1000; // 5 dakika

// Kullanıcı bulunamadığında bcrypt.compare hiç çalışmazsa, "yok" ve "var ama
// şifre yanlış" yanıtları arasında ölçülebilir bir süre farkı oluşur — bu da
// bir saldırganın yanıt süresini ölçerek hangi e-postaların kayıtlı olduğunu
// (kullanıcı numaralandırma) çıkarmasına izin verebilir. Sahte bir hash'e
// karşı da bcrypt.compare çalıştırarak süreyi her iki durumda da eşitliyoruz.
const SAHTE_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8Nrhz2E7XlwZE0e6MQpuvNZFqLlV8m";

export const authOptions: NextAuthOptions = {
  // maxAge belirtilmezse NextAuth varsayılanı 30 gündür (+ kayan pencere —
  // her istekte süre sıfırdan başlar). 7 güne düşürüldü: bir hafta hiç
  // ziyaret edilmeyen bir oturum artık otomatik sona eriyor.
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
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
          await bcrypt.compare(credentials.password, SAHTE_HASH);
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
