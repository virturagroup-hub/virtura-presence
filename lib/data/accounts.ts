import { hash } from "bcryptjs";
import { NotificationStatus, UserActionTokenType } from "@prisma/client";

import { attachEmailOwnedRecordsToUser } from "@/lib/data/user-links";
import { dispatchNotificationEvents } from "@/lib/notification-delivery";
import { createUserActionToken, recordNotificationEvent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/text";

export async function getClaimSubmissionContext(token: string) {
  return prisma.userActionToken.findUnique({
    where: { token },
    include: {
      submission: {
        include: {
          business: true,
          submittedBy: true,
        },
      },
      user: true,
    },
  });
}

export async function getEmailVerificationContext(token: string) {
  return prisma.userActionToken.findUnique({
    where: { token },
    include: {
      submission: {
        include: {
          business: true,
        },
      },
      user: true,
    },
  });
}

export async function consumeEmailVerificationToken(token: string) {
  const verificationContext = await getEmailVerificationContext(token);

  if (
    !verificationContext ||
    verificationContext.type !== UserActionTokenType.VERIFY_EMAIL
  ) {
    throw new Error("That verification link is invalid.");
  }

  if (verificationContext.consumedAt) {
    return {
      email: verificationContext.email,
      alreadyVerified: true,
      businessName:
        verificationContext.submission?.businessName ??
        verificationContext.submission?.business.name ??
        "your business",
    };
  }

  if (verificationContext.expiresAt < new Date()) {
    throw new Error("This verification link has expired.");
  }

  if (!verificationContext.userId) {
    throw new Error("This verification link is not attached to a user account.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: verificationContext.userId!,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    await tx.userActionToken.update({
      where: {
        id: verificationContext.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    return {
      email: verificationContext.email,
      alreadyVerified: false,
      businessName:
        verificationContext.submission?.businessName ??
        verificationContext.submission?.business.name ??
        "your business",
    };
  });
}

export async function claimSubmissionAccount(input: {
  token: string;
  name: string;
  password: string;
}) {
  const claimContext = await getClaimSubmissionContext(input.token);

  if (!claimContext || claimContext.type !== UserActionTokenType.CLAIM_SUBMISSION) {
    throw new Error("That claim link is invalid.");
  }

  if (claimContext.consumedAt) {
    throw new Error("This claim link has already been used.");
  }

  if (claimContext.expiresAt < new Date()) {
    throw new Error("This claim link has expired.");
  }

  const normalizedEmail = normalizeEmail(claimContext.email);

  const transactionResult = await prisma.$transaction(async (tx) => {
    const notificationEventIds: string[] = [];
    const existingUser = await tx.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser?.passwordHash) {
      await attachEmailOwnedRecordsToUser(tx, {
        userId: existingUser.id,
        email: normalizedEmail,
      });

      await tx.userActionToken.update({
        where: { id: claimContext.id },
        data: {
          consumedAt: new Date(),
          userId: existingUser.id,
        },
      });

      await recordNotificationEvent(tx, {
        type: "ACCOUNT_LINKED",
        businessId: claimContext.submission?.businessId,
        presenceCheckId: claimContext.presenceCheckId ?? undefined,
        userId: existingUser.id,
        recipient: normalizedEmail,
        subject: "Existing client account linked to submission",
        payload: {
          tokenType: "claim_submission",
          existingUser: true,
        },
      });

      return {
        email: normalizedEmail,
        userExisted: true,
        notificationEventIds,
      };
    }

    const passwordHash = await hash(input.password, 10);

    const user =
      existingUser ??
      (await tx.user.create({
        data: {
          email: normalizedEmail,
          name: input.name,
          role: "CLIENT",
          passwordHash,
        },
      }));

    if (existingUser) {
      await tx.user.update({
        where: { id: existingUser.id },
        data: {
          name: existingUser.name ?? input.name,
          passwordHash,
          role: existingUser.role ?? "CLIENT",
        },
      });
    }

    await attachEmailOwnedRecordsToUser(tx, {
      userId: user.id,
      email: normalizedEmail,
    });

    await tx.userActionToken.update({
      where: { id: claimContext.id },
      data: {
        consumedAt: new Date(),
        userId: user.id,
      },
    });

    const verifyToken = await createUserActionToken(tx, {
      type: "VERIFY_EMAIL",
      email: normalizedEmail,
      userId: user.id,
      presenceCheckId: claimContext.presenceCheckId ?? undefined,
      expiresInHours: 168,
    });

    await recordNotificationEvent(tx, {
      type: "ACCOUNT_LINKED",
      businessId: claimContext.submission?.businessId,
      presenceCheckId: claimContext.presenceCheckId ?? undefined,
      userId: user.id,
      recipient: normalizedEmail,
      subject: "Submission linked to client account",
      payload: {
        tokenType: "claim_submission",
      },
    });

    const verificationNotification = await recordNotificationEvent(tx, {
      type: "EMAIL_VERIFICATION_READY",
      status: NotificationStatus.PENDING,
      businessId: claimContext.submission?.businessId,
      presenceCheckId: claimContext.presenceCheckId ?? undefined,
      userId: user.id,
      channel: "email",
      recipient: normalizedEmail,
      subject: "Verify your Virtura Presence email",
      payload: {
        token: verifyToken.token,
        type: "verify_email",
      },
    });
    notificationEventIds.push(verificationNotification.id);

    return {
      email: normalizedEmail,
      userExisted: Boolean(existingUser),
      notificationEventIds,
    };
  });

  await dispatchNotificationEvents(transactionResult.notificationEventIds);

  return {
    email: transactionResult.email,
    userExisted: transactionResult.userExisted,
  };
}
