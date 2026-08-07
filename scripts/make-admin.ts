// Bir kullanıcıyı ADMIN yapar. İlk admin hesabını oluşturmanın yolu budur —
// admin panelinde kendi kendine "admin yap" özelliği bilinçli olarak yok.
//
// Kullanım: npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/make-admin.ts eposta@ornek.com
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Kullanım: npx prisma db execute ... değil — bkz. dosya başındaki komut. E-posta belirtilmedi.");
    process.exit(1);
  }

  const kullanici = await db.user.update({
    where: { email: email.toLowerCase() },
    data: { role: "ADMIN" },
  });

  console.log(`${kullanici.email} artık ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
