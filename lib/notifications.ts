import { randomBytes } from "crypto";

import {
  NotificationStatus,
  type NotificationEventType,
  type Prisma,
  type PrismaClient,
  type UserActionTokenType,
} from "@prisma/client";

type DbLike = Prisma.TransactionClient | PrismaClient;

type NotificationInput = {
  type: NotificationEventType;
  status?: NotificationStatus;
  businessId?: string;
  presenceCheckId?: string;
  auditId?: string;
  userId?: string;
  channel?: string;
  recipient?: string;
  subject?: string;
  payload?: Prisma.InputJsonValue;
  errorMessage?: string;
};

type ActionTokenInput = {
  type: UserActionTokenType;
  email: string;
  userId?: string;
  presenceCheckId?: string;
  expiresInHours?: number;
};

export async function recordNotificationEvent(db: DbLike, input: NotificationInput) {
  const status = input.status ?? NotificationStatus.LOGGED;

  return db.notificationEvent.create({
    data: {
      type: input.type,
      status,
      businessId: input.businessId,
      presenceCheckId: input.presenceCheckId,
      auditId: input.auditId,
      userId: input.userId,
      channel: input.channel ?? "log",
      recipient: input.recipient,
      subject: input.subject,
      payload: input.payload,
      errorMessage: input.errorMessage,
      processedAt: status !== NotificationStatus.PENDING ? new Date() : null,
    },
  });
}

export async function createUserActionToken(db: DbLike, input: ActionTokenInput) {
  const token = randomBytes(24).toString("hex");

  return db.userActionToken.create({
    data: {
      type: input.type,
      token,
      email: input.email,
      userId: input.userId,
      presenceCheckId: input.presenceCheckId,
      expiresAt: new Date(
        Date.now() + (input.expiresInHours ?? 48) * 60 * 60 * 1000,
      ),
    },
  });
}
