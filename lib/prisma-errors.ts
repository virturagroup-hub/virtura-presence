function isMissingTableMessage(message: string) {
  return (
    message.includes("does not exist in the current database") ||
    message.includes("The table `public.") ||
    message.includes("P2021")
  );
}

function isConnectionMessage(message: string) {
  return (
    message.includes("Can't reach database server") ||
    message.includes("Unable to connect to the PostgreSQL server") ||
    message.includes("connect ECONNREFUSED")
  );
}

export function toUserFacingDatabaseError(
  error: unknown,
  fallback: string,
) {
  const message = error instanceof Error ? error.message : fallback;

  if (isMissingTableMessage(message)) {
    return "Virtura Presence is connected to the database, but the Prisma tables have not been created there yet. Run `npm run db:migrate:deploy` and then `npm run db:seed` against your Neon/Vercel database, then try again.";
  }

  if (isConnectionMessage(message)) {
    return "Virtura Presence could not reach the configured PostgreSQL database. Double-check your Neon/Vercel connection variables and try again.";
  }

  return message;
}
