import {
  FollowUpStatus,
  NotificationStatus,
  RecommendationStatus,
  SubmissionStatus,
  type Prisma,
} from "@prisma/client";

import { dispatchNotificationEvents } from "@/lib/notification-delivery";
import { recordNotificationEvent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { servicePlans } from "@/lib/plan-catalog";
import { parseLineItems } from "@/lib/text";
import { workspaceAuditStateForIntent, type AuditEditorInput } from "@/lib/validations/audit";
import type { WorkspaceSearchInput } from "@/lib/validations/workspace-filters";

function buildWorkspaceWhereClause(filters: WorkspaceSearchInput): Prisma.PresenceCheckWhereInput {
  const where: Prisma.PresenceCheckWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.scoreTier) {
    where.scoreTier = filters.scoreTier;
  }

  if (filters.category) {
    where.businessCategory = {
      contains: filters.category,
      mode: "insensitive",
    };
  }

  if (filters.state) {
    where.state = {
      contains: filters.state,
      mode: "insensitive",
    };
  }

  if (filters.search) {
    where.OR = [
      {
        businessName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        contactEmail: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        serviceArea: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        businessCategory: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

function buildWorkspaceOrderBy(filters: WorkspaceSearchInput): Prisma.PresenceCheckOrderByWithRelationInput {
  if (filters.sort === "oldest") {
    return { submittedAt: "asc" };
  }

  if (filters.sort === "highest_score") {
    return { score: "desc" };
  }

  if (filters.sort === "lowest_score") {
    return { score: "asc" };
  }

  return { submittedAt: "desc" };
}

export async function getWorkspaceDashboardData(filters: WorkspaceSearchInput) {
  const where = buildWorkspaceWhereClause(filters);

  const [submissions, totalSubmissions, inReviewCount, publishedCount, followUpDueCount] =
    await Promise.all([
      prisma.presenceCheck.findMany({
        where,
        orderBy: buildWorkspaceOrderBy(filters),
        include: {
          business: true,
          submittedBy: true,
          audit: true,
          followUps: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      }),
      prisma.presenceCheck.count(),
      prisma.presenceCheck.count({
        where: {
          status: SubmissionStatus.IN_REVIEW,
        },
      }),
      prisma.presenceCheck.count({
        where: {
          status: SubmissionStatus.PUBLISHED,
        },
      }),
      prisma.followUp.count({
        where: {
          status: {
            in: ["QUEUED", "SCHEDULED"],
          },
        },
      }),
    ]);

  return {
    submissions,
    summaryCards: [
      {
        label: "Total submissions",
        value: String(totalSubmissions),
        change: "Live pipeline",
      },
      {
        label: "In review",
        value: String(inReviewCount),
        change: "Active consultant work",
      },
      {
        label: "Published audits",
        value: String(publishedCount),
        change: "Client-visible reports",
      },
      {
        label: "Follow-up due",
        value: String(followUpDueCount),
        change: "Queued nurture touchpoints",
      },
    ],
    availablePlans: await prisma.servicePlan.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  };
}

export async function getWorkspaceSubmissionDetail(submissionId: string) {
  const submission = await prisma.presenceCheck.findUnique({
    where: {
      id: submissionId,
    },
    include: {
      business: true,
      submittedBy: true,
      assignedConsultant: true,
      categoryScores: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      internalNotes: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: true,
        },
      },
      followUps: {
        orderBy: {
          createdAt: "desc",
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
            include: {
              servicePlan: true,
            },
            orderBy: {
              priority: "asc",
            },
          },
        },
      },
      notificationEvents: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!submission) {
    return null;
  }

  return {
    submission,
    availablePlans: await prisma.servicePlan.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  };
}

export async function upsertSubmissionAudit(
  input: AuditEditorInput,
  actor: {
    id: string;
    role?: "CLIENT" | "CONSULTANT" | "ADMIN";
  },
) {
  const nextAuditStatus = workspaceAuditStateForIntent[input.intent];

  const transactionResult = await prisma.$transaction(async (tx) => {
    const notificationEventIds: string[] = [];
    const submission = await tx.presenceCheck.findUnique({
      where: {
        id: input.submissionId,
      },
      include: {
        business: true,
        audit: true,
        followUps: true,
      },
    });

    if (!submission) {
      throw new Error("Submission not found.");
    }

    if (
      input.intent === "unpublish" &&
      actor.role !== "ADMIN"
    ) {
      throw new Error("Only admins can unpublish an audit.");
    }

    if (
      input.intent === "unpublish" &&
      submission.followUps.some((item) =>
        ["SENT", "REPLIED", "BOOKED"].includes(item.status),
      )
    ) {
      throw new Error("This audit cannot be unpublished because follow-up has already progressed.");
    }

    const linkedPlans = await tx.servicePlan.findMany({
      where: {
        slug: {
          in: input.selectedPlanSlugs,
        },
      },
    });

    const audit = await tx.manualAudit.upsert({
      where: {
        presenceCheckId: submission.id,
      },
      create: {
        businessId: submission.businessId,
        presenceCheckId: submission.id,
        authorId: actor.id,
        publishedById: input.intent === "publish" ? actor.id : null,
        status: nextAuditStatus,
        title: input.title,
        executiveSummary: input.executiveSummary || null,
        clientSummary: input.clientSummary || null,
        internalSummary: input.internalSummary || null,
        strengths: parseLineItems(input.strengthsText),
        improvementOpportunities: parseLineItems(input.improvementText),
        nextSteps: parseLineItems(input.nextStepsText),
        publishedAt: input.intent === "publish" ? new Date() : null,
      },
      update: {
        authorId: actor.id,
        publishedById:
          input.intent === "publish"
            ? actor.id
            : input.intent === "unpublish"
              ? null
              : undefined,
        status: nextAuditStatus,
        title: input.title,
        executiveSummary: input.executiveSummary || null,
        clientSummary: input.clientSummary || null,
        internalSummary: input.internalSummary || null,
        strengths: parseLineItems(input.strengthsText),
        improvementOpportunities: parseLineItems(input.improvementText),
        nextSteps: parseLineItems(input.nextStepsText),
        publishedAt:
          input.intent === "publish"
            ? new Date()
            : input.intent === "unpublish"
              ? null
              : undefined,
      },
    });

    await tx.auditSection.deleteMany({
      where: {
        auditId: audit.id,
      },
    });

    await tx.auditSection.createMany({
      data: input.sections.map((section, index) => ({
        auditId: audit.id,
        category: section.category,
        score: section.score,
        headline: section.headline,
        clientFacingNotes: section.clientFacingNotes,
        internalNotes: section.internalNotes || null,
        displayOrder: index,
      })),
    });

    await tx.planRecommendation.deleteMany({
      where: {
        presenceCheckId: submission.id,
      },
    });

    if (linkedPlans.length) {
      await tx.planRecommendation.createMany({
        data: linkedPlans.map((plan, index) => ({
          businessId: submission.businessId,
          presenceCheckId: submission.id,
          auditId: audit.id,
          servicePlanId: plan.id,
          rationale:
            input.serviceRecommendationRationale ||
            `Recommended during the ${input.intent === "publish" ? "published" : "draft"} audit review.`,
          priority: index + 1,
          status:
            input.intent === "publish"
              ? RecommendationStatus.PRESENTED
              : RecommendationStatus.PROPOSED,
          clientVisible: input.intent === "publish",
        })),
      });
    }

    const nextSubmissionStatus =
      input.intent === "publish"
        ? SubmissionStatus.PUBLISHED
        : input.intent === "unpublish"
          ? SubmissionStatus.IN_REVIEW
          : SubmissionStatus.IN_REVIEW;

    await tx.presenceCheck.update({
      where: {
        id: submission.id,
      },
      data: {
        status: nextSubmissionStatus,
        updatedAt: new Date(),
      },
    });

    await tx.business.update({
      where: {
        id: submission.businessId,
      },
      data: {
        status: nextSubmissionStatus,
        publishedAt: input.intent === "publish" ? new Date() : null,
      },
    });

    if (input.intent === "publish") {
      const existingQueuedFollowUp = await tx.followUp.findFirst({
        where: {
          presenceCheckId: submission.id,
          status: {
            in: ["QUEUED", "SCHEDULED"],
          },
        },
      });

      if (!existingQueuedFollowUp) {
        await tx.followUp.create({
          data: {
            businessId: submission.businessId,
            presenceCheckId: submission.id,
            status: "QUEUED",
            channel: "email",
            subject: "Published audit follow-up",
            notes:
              "Placeholder follow-up created automatically when the audit was published.",
          },
        });
      }
    }

    const auditNotification = await recordNotificationEvent(tx, {
      type: input.intent === "publish" ? "AUDIT_PUBLISHED" : "AUDIT_SAVED",
      businessId: submission.businessId,
      presenceCheckId: submission.id,
      auditId: audit.id,
      userId: actor.id,
      status:
        input.intent === "publish"
          ? NotificationStatus.PENDING
          : NotificationStatus.LOGGED,
      channel: input.intent === "publish" ? "email" : "log",
      recipient: input.intent === "publish" ? submission.contactEmail : undefined,
      subject:
        input.intent === "publish"
          ? "Your consultant-reviewed audit is now published"
          : "Audit draft updated",
      payload: {
        intent: input.intent,
        selectedPlanSlugs: input.selectedPlanSlugs,
      },
    });
    if (input.intent === "publish") {
      notificationEventIds.push(auditNotification.id);
    }

    if (linkedPlans.length) {
      await recordNotificationEvent(tx, {
        type: "SERVICE_RECOMMENDED",
        businessId: submission.businessId,
        presenceCheckId: submission.id,
        auditId: audit.id,
        userId: actor.id,
        subject: "Service recommendations updated",
        payload: {
          selectedPlanSlugs: input.selectedPlanSlugs,
        },
      });
    }

    if (input.intent === "publish") {
      await recordNotificationEvent(tx, {
        type: "FOLLOW_UP_QUEUED",
        businessId: submission.businessId,
        presenceCheckId: submission.id,
        auditId: audit.id,
        userId: actor.id,
        subject: "Follow-up placeholder queued",
        payload: {
          channel: "email",
        },
      });
    }

    return {
      audit,
      notificationEventIds,
    };
  });

  await dispatchNotificationEvents(transactionResult.notificationEventIds);

  return transactionResult.audit;
}

export async function updateSubmissionWorkflowStatus(input: {
  submissionId: string;
  status: SubmissionStatus;
  actorId: string;
}) {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const notificationEventIds: string[] = [];
    const submission = await tx.presenceCheck.findUnique({
      where: {
        id: input.submissionId,
      },
    });

    if (!submission) {
      throw new Error("Submission not found.");
    }

    const updated = await tx.presenceCheck.update({
      where: {
        id: input.submissionId,
      },
      data: {
        status: input.status,
      },
    });

    await tx.business.update({
      where: {
        id: submission.businessId,
      },
      data: {
        status: input.status,
      },
    });

    if (input.status === SubmissionStatus.FOLLOW_UP_SENT) {
      const latestFollowUp = await tx.followUp.findFirst({
        where: {
          presenceCheckId: submission.id,
          status: {
            in: [FollowUpStatus.QUEUED, FollowUpStatus.SCHEDULED, FollowUpStatus.SENT],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const followUp =
        latestFollowUp
          ? await tx.followUp.update({
              where: {
                id: latestFollowUp.id,
              },
              data: {
                status: FollowUpStatus.SENT,
                sentAt: new Date(),
              },
            })
          : await tx.followUp.create({
              data: {
                businessId: submission.businessId,
                presenceCheckId: submission.id,
                status: FollowUpStatus.SENT,
                sentAt: new Date(),
                channel: "email",
                subject: "A quick follow-up from Virtura Presence",
                notes:
                  "Checking in after the published audit to offer practical next-step support.",
              },
            });

      const followUpNotification = await recordNotificationEvent(tx, {
        type: "FOLLOW_UP_SENT",
        status: NotificationStatus.PENDING,
        businessId: submission.businessId,
        presenceCheckId: submission.id,
        userId: input.actorId,
        recipient: submission.contactEmail,
        channel: "email",
        subject: followUp.subject ?? "A quick follow-up from Virtura Presence",
        payload: {
          followUpId: followUp.id,
        },
      });
      notificationEventIds.push(followUpNotification.id);
    }

    return {
      updated,
      notificationEventIds,
    };
  });

  await dispatchNotificationEvents(transactionResult.notificationEventIds);

  return transactionResult.updated;
}

export async function createSubmissionInternalNote(input: {
  submissionId: string;
  authorId: string;
  title?: string;
  body: string;
}) {
  const submission = await prisma.presenceCheck.findUnique({
    where: {
      id: input.submissionId,
    },
  });

  if (!submission) {
    throw new Error("Submission not found.");
  }

  return prisma.internalNote.create({
    data: {
      businessId: submission.businessId,
      presenceCheckId: submission.id,
      authorId: input.authorId,
      title: input.title || null,
      body: input.body,
    },
    include: {
      author: true,
    },
  });
}

export async function getFallbackPlanCatalog() {
  const plans = await prisma.servicePlan.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return plans.length ? plans : servicePlans;
}
