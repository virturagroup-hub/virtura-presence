import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const pooledDatabaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  "";

const directDatabaseUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL ??
  pooledDatabaseUrl;

if (!process.env.DATABASE_URL && pooledDatabaseUrl) {
  process.env.DATABASE_URL = pooledDatabaseUrl;
}

if (!process.env.DATABASE_URL_UNPOOLED && directDatabaseUrl) {
  process.env.DATABASE_URL_UNPOOLED = directDatabaseUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: pooledDatabaseUrl,
  },
});
