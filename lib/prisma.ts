import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getFirstDefinedEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

export function getDatabaseUrlOrThrow() {
  const databaseUrl = getFirstDefinedEnv([
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
  ]);

  if (!databaseUrl) {
    throw new Error(
      "A pooled PostgreSQL connection is required for Virtura Presence. Set `DATABASE_URL` in `.env.local` or provide the Vercel/Neon `POSTGRES_PRISMA_URL` or `POSTGRES_URL` variables before starting the app, running Prisma, or deploying.",
    );
  }

  try {
    const parsed = new URL(databaseUrl);

    if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
      throw new Error("unsupported protocol");
    }
  } catch {
    throw new Error(
      "The primary PostgreSQL connection string must be valid, for example `postgresql://USER:PASSWORD@HOST:5432/virtura_presence?sslmode=require`.",
    );
  }

  return databaseUrl;
}

const databaseUrl = getDatabaseUrlOrThrow();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
