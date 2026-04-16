import "@/scripts/load-env";
import { prisma } from "@/lib/prisma";

type DatabaseMetadata = {
  currentDatabase: string;
  currentSchema: string;
  currentUser: string;
};

async function main() {
  const [metadata] = await prisma.$queryRaw<DatabaseMetadata[]>`
    SELECT
      current_database()::text AS "currentDatabase",
      current_schema()::text AS "currentSchema",
      current_user::text AS "currentUser"
  `;

  const [servicePlans, users, businesses, submissions, audits, pendingNotifications] =
    await Promise.all([
      prisma.servicePlan.count(),
      prisma.user.count(),
      prisma.business.count(),
      prisma.presenceCheck.count(),
      prisma.manualAudit.count(),
      prisma.notificationEvent.count({
        where: {
          status: "PENDING",
        },
      }),
    ]);

  if (servicePlans === 0) {
    throw new Error(
      "Connected to PostgreSQL, but no service plans were found. Run `npm run db:seed` to load the baseline Virtura Presence catalog.",
    );
  }

  console.info("Virtura Presence database check", {
    database: metadata?.currentDatabase ?? "unknown",
    schema: metadata?.currentSchema ?? "unknown",
    user: metadata?.currentUser ?? "unknown",
    servicePlans,
    users,
    businesses,
    submissions,
    audits,
    pendingNotifications,
  });
}

main()
  .catch((error) => {
    const message =
      error instanceof Error ? error.message : "Virtura Presence database check failed.";
    const output =
      message.includes("Can't reach database server")
        ? "Unable to connect to the PostgreSQL server from DATABASE_URL. Confirm the host, port, credentials, SSL requirements, and that the database is reachable from your current environment."
        : message;

    console.error(
      output,
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
