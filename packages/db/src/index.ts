import { PrismaClient } from "@prisma/client";

// Singleton Prisma client — imported only by apps/api and background workers.
// Never import @clip/db from a Next.js app (see docs/architecture/SYSTEM_ARCHITECTURE.md).
declare global {
  // eslint-disable-next-line no-var
  var __clipPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__clipPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__clipPrisma = prisma;
}

export * from "@prisma/client";
