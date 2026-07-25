import { PrismaClient } from "@prisma/client";

// Global-scoped singleton so Turbopack's dev-mode hot-reload doesn't spawn a
// fresh PrismaClient (and a fresh DB connection pool) on every file save.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
