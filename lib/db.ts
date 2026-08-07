import { PrismaClient } from "@prisma/client";

// Next.js dev modunda hot-reload sırasında birden fazla PrismaClient
// oluşmasını önlemek için global'e bağlıyoruz.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
