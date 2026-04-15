import {
  NotificationStatus,
  Prisma,
  UserActionTokenType,
} from "@prisma/client";

import { AuditPublishedEmail } from "@/emails/audit-published";
import { EmailVerificationEmail } from "@/emails/email-verification";
import { FollowUpEmail } from "@/emails/follow-up";
import { SubmissionConfirmationEmail } from "@/emails/submission-confirmation";
import { buildAppUrl } from "@/lib/app-url";
import { scoreTierLabel, categoryLabelFromKey } from "@/lib/display";
import { sendTransactionalEmail } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";
import { asStringArray } from "@/lib/text";

const notificationEventInclude = Prisma.validator<Prisma.NotificationEventInclude>()({
  business: true,
  user: true,
  submission: {
    include: {
      categoryScores: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      followUps: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  },
  audit: {
    include: {
      sections: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      planRecommendations: {
        where: {
          clientVisible: true,
        },
        include: {
          servicePlan: true,
        },
        orderBy: {
          priority: "asc",
        },
      },
    },
  },
});

type NotificationEventForDelivery = Prisma.NotificationEventGetPayload<{
  include: typeof notificationEventInclude;
}>;

function toPayloadRecord(payload: Prisma.JsonValue | null | undefined) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return payload as Record<string, unknown>;
}

async function findActionToken(
  event: NotificationEventForDelivery,
  type: UserActionTokenType,
) {
  return prisma.userActionToken.findFirst({
    where: {
      type,
      email: event.recipient ?? undefined,
      presenceCheckId: event.presenceCheckId ?? undefined,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function buildEmailPayload(event: NotificationEventForDelivery) {
  if (!event.recipient) {
    throw new Error("Notification event is missing a recipient email address.");
  }

  const payload = toPayloadRecord(event.payload);

  if (event.type === "SUBMISSION_CREATED") {
    if (!event.submission) {
      throw new Error("Submission confirmation email is missing submission context.");
    }

    return {
      to: event.recipient,
      subject: event.subject ?? `Your quick review for ${event.submission.businessName} is ready`,
      react: (
        <SubmissionConfirmationEmail
          businessName={event.submission.businessName}
          score={event.submission.score ?? 0}
          tierLabel={scoreTierLabel(event.submission.scoreTier) ?? "Quick review"}
          summary={event.submission.summary ?? "Your quick review is now available."}
          encouragement={event.submission.encouragement}
          strengths={asStringArray(event.submission.strengths)}
          improvements={asStringArray(event.submission.improvementAreas)}
          categoryScores={event.submission.categoryScores.map((category) => ({
            label: categoryLabelFromKey(category.category),
            score: category.score,
          }))}
          actionLabel="Open client portal"
          actionUrl={buildAppUrl("/portal")}
        />
      ),
    };
  }

  if (event.type === "CLAIM_LINK_CREATED") {
    if (!event.submission) {
      throw new Error("Claim-link email is missing submission context.");
    }

    const tokenFromPayload =
      typeof payload.token === "string" ? payload.token : undefined;
    const actionToken =
      tokenFromPayload ??
      (await findActionToken(event, UserActionTokenType.CLAIM_SUBMISSION))?.token;

    if (!actionToken) {
      throw new Error("Claim-link email could not locate a valid claim token.");
    }

    return {
      to: event.recipient,
      subject:
        event.subject ?? `Claim your Virtura Presence portal for ${event.submission.businessName}`,
      react: (
        <SubmissionConfirmationEmail
          businessName={event.submission.businessName}
          score={event.submission.score ?? 0}
          tierLabel={scoreTierLabel(event.submission.scoreTier) ?? "Quick review"}
          summary={event.submission.summary ?? "Your quick review is now available."}
          encouragement={event.submission.encouragement}
          strengths={asStringArray(event.submission.strengths)}
          improvements={asStringArray(event.submission.improvementAreas)}
          categoryScores={event.submission.categoryScores.map((category) => ({
            label: categoryLabelFromKey(category.category),
            score: category.score,
          }))}
          actionLabel="Create your client account"
          actionUrl={buildAppUrl(`/claim/${actionToken}`)}
        />
      ),
    };
  }

  if (event.type === "EMAIL_VERIFICATION_READY") {
    const tokenFromPayload =
      typeof payload.token === "string" ? payload.token : undefined;
    const actionToken =
      tokenFromPayload ??
      (await findActionToken(event, UserActionTokenType.VERIFY_EMAIL))?.token;

    if (!actionToken) {
      throw new Error("Verification email could not locate a valid verification token.");
    }

    return {
      to: event.recipient,
      subject: event.subject ?? "Verify your Virtura Presence email address",
      react: (
        <EmailVerificationEmail
          businessName={
            event.business?.name ??
            event.submission?.businessName ??
            "your Virtura Presence account"
          }
          verifyUrl={buildAppUrl(`/verify-email/${actionToken}`)}
        />
      ),
    };
  }

  if (event.type === "AUDIT_PUBLISHED") {
    if (!event.audit || !event.submission) {
      throw new Error("Audit-published email is missing audit context.");
    }

    return {
      to: event.recipient,
      subject:
        event.subject ?? `Your published Virtura Presence audit is ready`,
      react: (
        <AuditPublishedEmail
          businessName={event.submission.businessName}
          clientSummary={
            event.audit.clientSummary ??
            event.audit.executiveSummary ??
            event.submission.summary ??
            "Your consultant-reviewed audit is now available."
          }
          nextSteps={event.audit.nextSteps}
          recommendedPlans={event.audit.planRecommendations.map(
            (recommendation) => recommendation.servicePlan.name,
          )}
          reportUrl={buildAppUrl("/portal/report")}
        />
      ),
    };
  }

  if (event.type === "FOLLOW_UP_SENT") {
    const note =
      event.submission?.followUps[0]?.notes ??
      event.submission?.summary ??
      "Your audit and next steps are still available in the client portal.";

    return {
      to: event.recipient,
      subject: event.subject ?? "A quick follow-up from Virtura Presence",
      react: (
        <FollowUpEmail
          businessName={
            event.business?.name ??
            event.submission?.businessName ??
            "your business"
          }
          note={note}
          portalUrl={buildAppUrl("/portal")}
        />
      ),
    };
  }

  return null;
}

export async function processNotificationEventById(eventId: string) {
  const event = await prisma.notificationEvent.findUnique({
    where: {
      id: eventId,
    },
    include: notificationEventInclude,
  });

  if (!event) {
    return {
      eventId,
      status: "missing" as const,
    };
  }

  if (event.status === NotificationStatus.PROCESSED) {
    return {
      eventId,
      status: "already_processed" as const,
    };
  }

  try {
    const emailPayload = await buildEmailPayload(event);

    if (!emailPayload) {
      await prisma.notificationEvent.update({
        where: {
          id: event.id,
        },
        data: {
          status: NotificationStatus.LOGGED,
          processedAt: new Date(),
          errorMessage: null,
        },
      });

      return {
        eventId,
        status: "logged_only" as const,
      };
    }

    const result = await sendTransactionalEmail(emailPayload);

    if (!result.ok) {
      await prisma.notificationEvent.update({
        where: {
          id: event.id,
        },
        data: {
          status: NotificationStatus.FAILED,
          channel: result.channel,
          errorMessage: result.error,
          processedAt: new Date(),
        },
      });

      return {
        eventId,
        status: "failed" as const,
        error: result.error,
      };
    }

    await prisma.notificationEvent.update({
      where: {
        id: event.id,
      },
      data: {
        status: NotificationStatus.PROCESSED,
        channel: result.channel,
        providerMessageId: result.providerMessageId ?? null,
        errorMessage: null,
        processedAt: new Date(),
      } satisfies Prisma.NotificationEventUncheckedUpdateInput,
    });

    return {
      eventId,
      status: "processed" as const,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Notification processing failed unexpectedly.";

    await prisma.notificationEvent.update({
      where: {
        id: event.id,
      },
      data: {
        status: NotificationStatus.FAILED,
        errorMessage: message,
        processedAt: new Date(),
      },
    });

    return {
      eventId,
      status: "failed" as const,
      error: message,
    };
  }
}

export async function dispatchNotificationEvents(eventIds: string[]) {
  const uniqueEventIds = [...new Set(eventIds.filter(Boolean))];

  if (!uniqueEventIds.length) {
    return [];
  }

  return Promise.all(uniqueEventIds.map((eventId) => processNotificationEventById(eventId)));
}

export async function processPendingNotificationEvents(limit = 25) {
  const pendingEvents = await prisma.notificationEvent.findMany({
    where: {
      status: NotificationStatus.PENDING,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
    select: {
      id: true,
    },
  });

  return dispatchNotificationEvents(pendingEvents.map((event) => event.id));
}
