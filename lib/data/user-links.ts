import type { Prisma, PrismaClient } from "@prisma/client";

import { normalizeEmail } from "@/lib/text";

type DbLike = Prisma.TransactionClient | PrismaClient;

export async function attachEmailOwnedRecordsToUser(
  db: DbLike,
  input: {
    userId: string;
    email: string;
  },
) {
  const email = normalizeEmail(input.email);

  const [submissionResult, businessResult, tokenResult] = await Promise.all([
    db.presenceCheck.updateMany({
      where: {
        contactEmail: email,
        OR: [{ submittedById: null }, { submittedById: input.userId }],
      },
      data: {
        submittedById: input.userId,
      },
    }),
    db.business.updateMany({
      where: {
        primaryEmail: email,
        OR: [{ primaryContactId: null }, { primaryContactId: input.userId }],
      },
      data: {
        primaryContactId: input.userId,
      },
    }),
    db.userActionToken.updateMany({
      where: {
        email,
        OR: [{ userId: null }, { userId: input.userId }],
      },
      data: {
        userId: input.userId,
      },
    }),
  ]);

  return {
    submissionsLinked: submissionResult.count,
    businessesLinked: businessResult.count,
    tokensLinked: tokenResult.count,
  };
}
