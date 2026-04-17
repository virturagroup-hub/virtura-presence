import {
  AuditScope,
  BusinessLifecycleStage,
  ComprehensiveReportRequestStatus,
  FollowUpStatus,
  NotificationStatus,
  RecommendationStatus,
  SubmissionStatus,
  Prisma,
} from "@prisma/client";

import {
  dispatchNotificationEvents,
  processNotificationEventById,
} from "@/lib/notification-delivery";
import { recordNotificationEvent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { servicePlans } from "@/lib/plan-catalog";
import { parseLineItems } from "@/lib/text";
import { buildAuditDraftAssist } from "@/lib/workspace-audit";
import {
  workspaceAuditStateForIntent,
  type AuditEditorInput,
  type WorkspaceNotificationActionInput,
} from "@/lib/validations/audit";
import type { WorkspaceSearchInput } from "@/lib/validations/workspace-filters";

const activeComprehensiveRequestStatuses = [
  ComprehensiveReportRequestStatus.REQUESTED,
  ComprehensiveReportRequestStatus.ACKNOWLEDGED,
  ComprehensiveReportRequestStatus.IN_PROGRESS,
];

const lifecycleReportStageOrder = [
  BusinessLifecycleStage.LEAD,
  BusinessLifecycleStage.FREE_AUDIT_REQUESTED,
  BusinessLifecycleStage.FREE_AUDIT_REVIEWED,
  BusinessLifecycleStage.COMPREHENSIVE_AUDIT_REQUESTED,
  BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS,
  BusinessLifecycleStage.AUDIT_PUBLISHED,
  BusinessLifecycleStage.FOLLOW_UP_SENT,
  BusinessLifecycleStage.CONVERTED,
  BusinessLifecycleStage.ONGOING_CARE,
  BusinessLifecycleStage.CLOSED_INACTIVE,
];

const lockedFollowUpStatuses: string[] = [
  FollowUpStatus.SENT,
  FollowUpStatus.REPLIED,
  FollowUpStatus.BOOKED,
];

function startOfCurrentMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSenderAuthorizationError(message?: string | null) {
  return Boolean(
    message?.toLowerCase().includes("not authorized to send emails from"),
  );
}

function isInsecureUrl(value?: string | null) {
  return Boolean(value?.trim().toLowerCase().startsWith("http://"));
}

const pipelineBusinessInclude = Prisma.validator<Prisma.BusinessInclude>()({
  primaryContact: true,
  assignedConsultant: true,
  presenceChecks: {
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      audit: {
        select: {
          id: true,
          status: true,
          scope: true,
          updatedAt: true,
          publishedAt: true,
          progressPercent: true,
        },
      },
      comprehensiveRequests: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      followUps: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  },
  audits: {
    orderBy: {
      updatedAt: "desc",
    },
    take: 1,
    select: {
      id: true,
      title: true,
      status: true,
      scope: true,
      updatedAt: true,
      publishedAt: true,
      progressPercent: true,
    },
  },
  comprehensiveRequests: {
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  },
  followUps: {
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  },
  notificationEvents: {
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  },
});

const businessDetailInclude = Prisma.validator<Prisma.BusinessInclude>()({
  primaryContact: true,
  assignedConsultant: true,
  presenceChecks: {
    orderBy: {
      submittedAt: "desc",
    },
    include: {
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
      comprehensiveRequests: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          requestedBy: true,
        },
      },
      followUps: {
        orderBy: {
          createdAt: "desc",
        },
      },
      notificationEvents: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      audit: {
        include: {
          author: true,
          publishedBy: true,
          sections: {
            orderBy: {
              displayOrder: "asc",
            },
          },
          checklistItems: {
            orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
          },
          evidence: {
            orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
          },
          planRecommendations: {
            include: {
              servicePlan: true,
            },
            orderBy: {
              priority: "asc",
            },
          },
          notificationEvents: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
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
  audits: {
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      author: true,
      publishedBy: true,
      sections: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      checklistItems: {
        orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
      },
      evidence: {
        orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
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
  planRecommendations: {
    include: {
      servicePlan: true,
      audit: {
        select: {
          id: true,
          title: true,
          status: true,
          scope: true,
          updatedAt: true,
        },
      },
      submission: {
        select: {
          id: true,
          submittedAt: true,
          score: true,
          scoreTier: true,
        },
      },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
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
  comprehensiveRequests: {
    orderBy: {
      createdAt: "desc",
    },
    include: {
      requestedBy: true,
    },
  },
  notificationEvents: {
    orderBy: {
      createdAt: "desc",
    },
    take: 25,
  },
});

const submissionDetailInclude = Prisma.validator<Prisma.PresenceCheckInclude>()({
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
  comprehensiveRequests: {
    orderBy: {
      createdAt: "desc",
    },
    include: {
      requestedBy: true,
    },
  },
  followUps: {
    orderBy: {
      createdAt: "desc",
    },
  },
  audit: {
    include: {
      author: true,
      publishedBy: true,
      sections: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      checklistItems: {
        orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
      },
      evidence: {
        orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
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
});

type PipelineBusiness = Prisma.BusinessGetPayload<{
  include: typeof pipelineBusinessInclude;
}>;

function buildWorkspaceWhereClause(filters: WorkspaceSearchInput): Prisma.BusinessWhereInput {
  const where: Prisma.BusinessWhereInput = {};
  const getAndConditions = () =>
    Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];

  if (filters.status) {
    where.OR = [{ status: filters.status }, { presenceChecks: { some: { status: filters.status } } }];
  }

  if (filters.scoreTier) {
    where.AND = [
      ...getAndConditions(),
      {
        OR: [
          { quickTier: filters.scoreTier },
          { presenceChecks: { some: { scoreTier: filters.scoreTier } } },
        ],
      },
    ];
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
    where.AND = [
      ...getAndConditions(),
      {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { ownerName: { contains: filters.search, mode: "insensitive" } },
          { primaryEmail: { contains: filters.search, mode: "insensitive" } },
          { primaryPhone: { contains: filters.search, mode: "insensitive" } },
          { serviceArea: { contains: filters.search, mode: "insensitive" } },
          { businessCategory: { contains: filters.search, mode: "insensitive" } },
          { city: { contains: filters.search, mode: "insensitive" } },
          { state: { contains: filters.search, mode: "insensitive" } },
        ],
      },
    ];
  }

  return where;
}

function buildWorkspaceOrderBy(
  filters: WorkspaceSearchInput,
): Prisma.BusinessOrderByWithRelationInput[] {
  if (filters.sort === "oldest") {
    return [{ latestSubmittedAt: "asc" }, { createdAt: "asc" }];
  }

  if (filters.sort === "highest_score") {
    return [{ quickScore: "desc" }, { latestSubmittedAt: "desc" }];
  }

  if (filters.sort === "lowest_score") {
    return [{ quickScore: "asc" }, { latestSubmittedAt: "desc" }];
  }

  return [{ latestSubmittedAt: "desc" }, { updatedAt: "desc" }];
}

function getLatestDate(...values: Array<Date | null | undefined>) {
  return values
    .filter((value): value is Date => value instanceof Date)
    .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
}

function buildCompanyPipelineCard(business: PipelineBusiness) {
  const latestSubmission = business.presenceChecks[0] ?? null;
  const previousSubmission = business.presenceChecks[1] ?? null;
  const latestAudit = business.audits[0] ?? latestSubmission?.audit ?? null;
  const latestRequest =
    business.comprehensiveRequests[0] ?? latestSubmission?.comprehensiveRequests[0] ?? null;
  const latestFollowUp =
    business.followUps[0] ?? latestSubmission?.followUps[0] ?? null;
  const latestNotification = business.notificationEvents[0] ?? null;
  const trendDelta =
    latestSubmission?.score != null && previousSubmission?.score != null
      ? latestSubmission.score - previousSubmission.score
      : null;

  return {
    id: business.id,
    name: business.name,
    ownerName: business.ownerName,
    primaryEmail: business.primaryEmail,
    primaryPhone: business.primaryPhone,
    businessCategory: business.businessCategory,
    city: business.city,
    state: business.state,
    serviceArea: business.serviceArea,
    status: business.status,
    lifecycleStage: business.lifecycleStage,
    quickScore: latestSubmission?.score ?? business.quickScore,
    quickTier: latestSubmission?.scoreTier ?? business.quickTier,
    quickSummary: latestSubmission?.summary ?? business.quickSummary,
    trendDelta,
    submissionCount: business.presenceChecks.length,
    latestSubmissionId: latestSubmission?.id ?? null,
    latestSubmissionAt: latestSubmission?.submittedAt ?? business.latestSubmittedAt,
    latestAuditStatus: latestAudit?.status ?? null,
    latestAuditScope: latestAudit?.scope ?? null,
    latestAuditProgressPercent: latestAudit?.progressPercent ?? null,
    latestRequestStatus: latestRequest?.status ?? null,
    latestFollowUpStatus: latestFollowUp?.status ?? null,
    latestActivityAt: getLatestDate(
      business.lastActivityAt,
      business.latestSubmittedAt,
      latestAudit?.updatedAt ?? null,
      latestRequest?.updatedAt ?? null,
      latestFollowUp?.updatedAt ?? null,
      latestNotification?.createdAt ?? null,
      business.updatedAt,
    ),
    submissions: business.presenceChecks.map((submission) => ({
      id: submission.id,
      submittedAt: submission.submittedAt,
      status: submission.status,
      score: submission.score,
      scoreTier: submission.scoreTier,
      summary: submission.summary,
      auditStatus: submission.audit?.status ?? null,
      auditScope: submission.audit?.scope ?? null,
      auditProgressPercent: submission.audit?.progressPercent ?? null,
      comprehensiveRequestStatus: submission.comprehensiveRequests[0]?.status ?? null,
      followUpStatus: submission.followUps[0]?.status ?? null,
      contactEmail: submission.contactEmail,
    })),
  };
}

function buildDraftAssistForBusiness(
  business: Prisma.BusinessGetPayload<{ include: typeof businessDetailInclude }>,
) {
  const latestSubmission = business.presenceChecks[0];

  if (!latestSubmission) {
    return [];
  }

  return buildAuditDraftAssist({
    businessName: business.name,
    websiteStatus: latestSubmission.websiteStatus,
    googleBusinessProfileStatus: latestSubmission.googleBusinessProfileStatus,
    reviewStrength: latestSubmission.reviewStrength,
    reviewRequestCadence: latestSubmission.reviewRequestCadence,
    socialPresenceLevel: latestSubmission.socialPresenceLevel,
    runsAdvertising: latestSubmission.runsAdvertising,
    lowestCategories: latestSubmission.categoryScores
      .slice()
      .sort((left, right) => left.score - right.score)
      .slice(0, 2)
      .map((item) => ({
        category: item.category,
        score: item.score,
      })),
    comprehensiveRequestNote: business.comprehensiveRequests[0]?.note,
  });
}

function lifecycleStageFromAudit(scope: AuditScope, published: boolean) {
  if (published) {
    return BusinessLifecycleStage.AUDIT_PUBLISHED;
  }

  return scope === AuditScope.COMPREHENSIVE
    ? BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS
    : BusinessLifecycleStage.FREE_AUDIT_REVIEWED;
}

function lifecycleStageFromSubmissionStatus(
  status: SubmissionStatus,
  currentStage: BusinessLifecycleStage,
) {
  if (status === SubmissionStatus.FOLLOW_UP_SENT) {
    return BusinessLifecycleStage.FOLLOW_UP_SENT;
  }

  if (status === SubmissionStatus.CONVERTED) {
    return BusinessLifecycleStage.CONVERTED;
  }

  if (status === SubmissionStatus.CLOSED) {
    return BusinessLifecycleStage.CLOSED_INACTIVE;
  }

  if (status === SubmissionStatus.PUBLISHED) {
    return BusinessLifecycleStage.AUDIT_PUBLISHED;
  }

  if (status === SubmissionStatus.IN_REVIEW) {
    return currentStage === BusinessLifecycleStage.COMPREHENSIVE_AUDIT_REQUESTED
      ? BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS
      : currentStage === BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS
        ? currentStage
        : BusinessLifecycleStage.FREE_AUDIT_REVIEWED;
  }

  return currentStage;
}

function businessStatusForLifecycleStage(
  lifecycleStage: BusinessLifecycleStage,
  fallbackStatus: SubmissionStatus,
) {
  switch (lifecycleStage) {
    case BusinessLifecycleStage.AUDIT_PUBLISHED:
      return SubmissionStatus.PUBLISHED;
    case BusinessLifecycleStage.FOLLOW_UP_SENT:
      return SubmissionStatus.FOLLOW_UP_SENT;
    case BusinessLifecycleStage.CONVERTED:
      return SubmissionStatus.CONVERTED;
    case BusinessLifecycleStage.CLOSED_INACTIVE:
      return SubmissionStatus.CLOSED;
    case BusinessLifecycleStage.FREE_AUDIT_REVIEWED:
    case BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS:
      return SubmissionStatus.IN_REVIEW;
    default:
      return fallbackStatus;
  }
}

async function touchBusinessActivity(
  tx: Prisma.TransactionClient,
  input: {
    businessId: string;
    lifecycleStage?: BusinessLifecycleStage;
    status?: SubmissionStatus;
    publishedAt?: Date | null;
    lastClientContactAt?: Date | null;
  },
) {
  await tx.business.update({
    where: {
      id: input.businessId,
    },
    data: {
      lifecycleStage: input.lifecycleStage,
      status: input.status,
      publishedAt: input.publishedAt,
      lastClientContactAt: input.lastClientContactAt,
      lastActivityAt: new Date(),
    },
  });
}

async function getSubmissionForNotification(
  tx: Prisma.TransactionClient,
  input: WorkspaceNotificationActionInput,
) {
  if (input.submissionId) {
    return tx.presenceCheck.findUnique({
      where: {
        id: input.submissionId,
      },
      include: {
        audit: true,
        followUps: {
          orderBy: {
            createdAt: "desc",
          },
        },
        comprehensiveRequests: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  return tx.presenceCheck.findFirst({
    where: {
      businessId: input.businessId,
    },
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      audit: true,
      followUps: {
        orderBy: {
          createdAt: "desc",
        },
      },
      comprehensiveRequests: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

function notificationPayloadRecord(payload: Prisma.JsonValue | null | undefined) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return payload as Record<string, unknown>;
}

async function finalizeWorkspaceNotificationDelivery(input: {
  eventId: string;
  kind: WorkspaceNotificationActionInput["kind"];
}) {
  const event = await prisma.notificationEvent.findUnique({
    where: {
      id: input.eventId,
    },
    select: {
      businessId: true,
      presenceCheckId: true,
      payload: true,
    },
  });

  if (!event?.businessId) {
    return;
  }

  const now = new Date();
  const payload = notificationPayloadRecord(event.payload);
  const followUpId =
    typeof payload.followUpId === "string" ? payload.followUpId : null;

  if (input.kind === "follow_up") {
    if (followUpId) {
      await prisma.followUp.update({
        where: {
          id: followUpId,
        },
        data: {
          status: FollowUpStatus.SENT,
          sentAt: now,
        },
      });
    } else if (event.presenceCheckId) {
      const latestFollowUp = await prisma.followUp.findFirst({
        where: {
          presenceCheckId: event.presenceCheckId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (latestFollowUp) {
        await prisma.followUp.update({
          where: {
            id: latestFollowUp.id,
          },
          data: {
            status: FollowUpStatus.SENT,
            sentAt: now,
          },
        });
      }
    }
  }

  await prisma.business.update({
    where: {
      id: event.businessId,
    },
    data: {
      lifecycleStage:
        input.kind === "follow_up"
          ? BusinessLifecycleStage.FOLLOW_UP_SENT
          : undefined,
      status:
        input.kind === "follow_up"
          ? SubmissionStatus.FOLLOW_UP_SENT
          : undefined,
      lastClientContactAt: now,
      lastActivityAt: now,
    },
  });
}

async function processWorkspaceNotification(input: {
  eventId: string;
  kind: WorkspaceNotificationActionInput["kind"];
}) {
  const result = await processNotificationEventById(input.eventId);

  if (result.status === "processed") {
    await finalizeWorkspaceNotificationDelivery(input);
  }

  return result;
}

export async function getWorkspaceDashboardData(filters: WorkspaceSearchInput) {
  const where = buildWorkspaceWhereClause(filters);

  const [
    businesses,
    totalCompanies,
    inReviewCount,
    publishedCount,
    followUpDueCount,
    comprehensiveRequestCount,
  ] = await Promise.all([
    prisma.business.findMany({
      where,
      orderBy: buildWorkspaceOrderBy(filters),
      include: pipelineBusinessInclude,
    }),
    prisma.business.count(),
    prisma.business.count({
      where: {
        lifecycleStage: {
          in: [
            BusinessLifecycleStage.FREE_AUDIT_REVIEWED,
            BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS,
          ],
        },
      },
    }),
    prisma.manualAudit.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.followUp.count({
      where: {
        status: {
          in: [FollowUpStatus.QUEUED, FollowUpStatus.SCHEDULED],
        },
      },
    }),
    prisma.comprehensiveReportRequest.count({
      where: {
        status: {
          in: activeComprehensiveRequestStatuses,
        },
      },
    }),
  ]);

  return {
    companies: businesses.map(buildCompanyPipelineCard),
    summaryCards: [
      {
        label: "Active companies",
        value: String(totalCompanies),
        change: "Grouped pipeline records",
      },
      {
        label: "In review",
        value: String(inReviewCount),
        change: "Free and comprehensive work in motion",
      },
      {
        label: "Published audits",
        value: String(publishedCount),
        change: "Client-visible reports",
      },
      {
        label: "Follow-up due",
        value: String(followUpDueCount),
        change: "Queued client touchpoints",
      },
      {
        label: "Comprehensive requests",
        value: String(comprehensiveRequestCount),
        change: "Client-raised opportunities",
      },
    ],
  };
}

export async function getWorkspaceClientsData(filters: WorkspaceSearchInput) {
  return getWorkspaceDashboardData(filters);
}

export async function getWorkspaceReportsData() {
  const monthStart = startOfCurrentMonth();
  const acceptedRecommendationWhere = {
    status: RecommendationStatus.ACCEPTED,
  } satisfies Prisma.PlanRecommendationWhereInput;

  const [
    totalFreeAudits,
    freeAuditsThisMonth,
    acceptedServicesTotal,
    acceptedServicesThisMonth,
    customerBusinesses,
    newCustomerBusinesses,
    totalComprehensiveAudits,
    comprehensiveAuditsThisMonth,
    openComprehensiveRequests,
    failedEmailsTotal,
    failedEmailsThisMonth,
    senderAuthorizationFailures,
    lifecycleBreakdown,
    planBreakdown,
    failedEmailEvents,
    insecureBusinesses,
  ] = await Promise.all([
    prisma.presenceCheck.count(),
    prisma.presenceCheck.count({
      where: {
        submittedAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.planRecommendation.count({
      where: acceptedRecommendationWhere,
    }),
    prisma.planRecommendation.count({
      where: {
        ...acceptedRecommendationWhere,
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.planRecommendation.findMany({
      where: acceptedRecommendationWhere,
      distinct: ["businessId"],
      select: {
        businessId: true,
      },
    }),
    prisma.planRecommendation.findMany({
      where: {
        ...acceptedRecommendationWhere,
        createdAt: {
          gte: monthStart,
        },
      },
      distinct: ["businessId"],
      select: {
        businessId: true,
      },
    }),
    prisma.manualAudit.count({
      where: {
        scope: AuditScope.COMPREHENSIVE,
      },
    }),
    prisma.manualAudit.count({
      where: {
        scope: AuditScope.COMPREHENSIVE,
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.comprehensiveReportRequest.count({
      where: {
        status: {
          in: activeComprehensiveRequestStatuses,
        },
      },
    }),
    prisma.notificationEvent.count({
      where: {
        channel: "email",
        status: NotificationStatus.FAILED,
      },
    }),
    prisma.notificationEvent.count({
      where: {
        channel: "email",
        status: NotificationStatus.FAILED,
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.notificationEvent.count({
      where: {
        channel: "email",
        status: NotificationStatus.FAILED,
        errorMessage: {
          contains: "not authorized to send emails from",
          mode: "insensitive",
        },
      },
    }),
    prisma.business.groupBy({
      by: ["lifecycleStage"],
      _count: {
        _all: true,
      },
    }),
    prisma.servicePlan.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        planRecommendations: {
          select: {
            status: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.notificationEvent.findMany({
      where: {
        channel: "email",
        status: NotificationStatus.FAILED,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        type: true,
        subject: true,
        recipient: true,
        errorMessage: true,
        createdAt: true,
        processedAt: true,
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.business.findMany({
      where: {
        OR: [
          {
            websiteUrl: {
              startsWith: "http://",
            },
          },
          {
            googleBusinessProfileUrl: {
              startsWith: "http://",
            },
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        name: true,
        websiteUrl: true,
        googleBusinessProfileUrl: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    monthStart,
    summaryCards: [
      {
        label: "Free audits",
        value: String(freeAuditsThisMonth),
        change: `${totalFreeAudits} total presence checks recorded`,
      },
      {
        label: "New customers",
        value: String(newCustomerBusinesses.length),
        change: `${customerBusinesses.length} companies with accepted services`,
      },
      {
        label: "Services purchased",
        value: String(acceptedServicesThisMonth),
        change: `${acceptedServicesTotal} accepted recommendations total`,
      },
      {
        label: "Comprehensive audits",
        value: String(comprehensiveAuditsThisMonth),
        change: `${totalComprehensiveAudits} total · ${openComprehensiveRequests} active requests`,
      },
      {
        label: "Failed email alerts",
        value: String(failedEmailsThisMonth),
        change: `${failedEmailsTotal} total delivery failures tracked`,
      },
    ],
    lifecycleBreakdown: lifecycleReportStageOrder
      .map((stage) => ({
        stage,
        count:
          lifecycleBreakdown.find((item) => item.lifecycleStage === stage)?._count._all ?? 0,
      }))
      .filter((item) => item.count > 0),
    serviceBreakdown: planBreakdown
      .map((plan) => {
        const acceptedCount = plan.planRecommendations.filter(
          (recommendation) => recommendation.status === RecommendationStatus.ACCEPTED,
        ).length;
        const presentedCount = plan.planRecommendations.filter(
          (recommendation) => recommendation.status === RecommendationStatus.PRESENTED,
        ).length;
        const proposedCount = plan.planRecommendations.filter(
          (recommendation) => recommendation.status === RecommendationStatus.PROPOSED,
        ).length;

        return {
          slug: plan.slug,
          name: plan.name,
          acceptedCount,
          presentedCount,
          proposedCount,
        };
      })
      .sort(
        (left, right) =>
          right.acceptedCount - left.acceptedCount ||
          right.presentedCount - left.presentedCount ||
          left.name.localeCompare(right.name),
      ),
    failedEmailAlerts: failedEmailEvents.map((event) => ({
      id: event.id,
      title: event.subject ?? "Email delivery failed",
      businessId: event.business?.id ?? null,
      businessName: event.business?.name ?? "Unlinked business",
      recipient: event.recipient ?? null,
      errorMessage: event.errorMessage ?? "Delivery failed without a stored provider message.",
      createdAt: event.createdAt,
      processedAt: event.processedAt,
      severity: (
        isSenderAuthorizationError(event.errorMessage) ? "critical" : "warning"
      ) as "critical" | "warning",
    })),
    insecureLinkAlerts: insecureBusinesses.map((business) => ({
      id: business.id,
      businessId: business.id,
      businessName: business.name,
      websiteUrl: isInsecureUrl(business.websiteUrl) ? business.websiteUrl : null,
      googleBusinessProfileUrl: isInsecureUrl(business.googleBusinessProfileUrl)
        ? business.googleBusinessProfileUrl
        : null,
      updatedAt: business.updatedAt,
    })),
    alertSummary: {
      failedEmailsTotal,
      senderAuthorizationFailures,
      insecureLinkCount: insecureBusinesses.length,
      activeComprehensiveRequests: openComprehensiveRequests,
    },
  };
}

export async function getWorkspaceBusinessDetail(businessId: string) {
  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
    include: businessDetailInclude,
  });

  if (!business) {
    return null;
  }

  const scoreTrend = business.presenceChecks
    .slice()
    .reverse()
    .map((submission) => ({
      id: submission.id,
      date: submission.submittedAt,
      score: submission.score ?? 0,
      businessName: submission.businessName,
      tier: submission.scoreTier,
    }));

  return {
    business,
    latestSubmission: business.presenceChecks[0] ?? null,
    latestAudit:
      business.presenceChecks.find((submission) => submission.audit)?.audit ??
      business.audits[0] ??
      null,
    latestPublishedAudit:
      business.audits.find((audit) => audit.status === "PUBLISHED") ?? null,
    scoreTrend,
    draftAssist: buildDraftAssistForBusiness(business),
    availablePlans: await prisma.servicePlan.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  };
}

export async function getAuditStudioData(input: {
  businessId?: string;
  submissionId?: string;
}) {
  const queueBusinesses = await prisma.business.findMany({
    where: {
      OR: [
        {
          lifecycleStage: {
            in: [
              BusinessLifecycleStage.FREE_AUDIT_REQUESTED,
              BusinessLifecycleStage.FREE_AUDIT_REVIEWED,
              BusinessLifecycleStage.COMPREHENSIVE_AUDIT_REQUESTED,
              BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS,
              BusinessLifecycleStage.AUDIT_PUBLISHED,
            ],
          },
        },
        {
          comprehensiveRequests: {
            some: {
              status: {
                in: activeComprehensiveRequestStatuses,
              },
            },
          },
        },
      ],
    },
    orderBy: [{ lastActivityAt: "desc" }, { latestSubmittedAt: "desc" }],
    take: 12,
    include: pipelineBusinessInclude,
  });

  const selectedBusinessId =
    input.businessId ??
    (input.submissionId
      ? (
          await prisma.presenceCheck.findUnique({
            where: {
              id: input.submissionId,
            },
            select: {
              businessId: true,
            },
          })
        )?.businessId
      : undefined) ??
    queueBusinesses[0]?.id;

  const detail = selectedBusinessId
    ? await getWorkspaceBusinessDetail(selectedBusinessId)
    : null;

  const selectedSubmission =
    detail?.business.presenceChecks.find(
      (submission) => submission.id === input.submissionId,
    ) ??
    detail?.latestSubmission ??
    null;

  return {
    queue: queueBusinesses.map((business) =>
      buildCompanyPipelineCard(business as PipelineBusiness),
    ),
    detail,
    selectedSubmission,
  };
}

export async function getWorkspaceSubmissionDetail(submissionId: string) {
  const submission = await prisma.presenceCheck.findUnique({
    where: {
      id: submissionId,
    },
    include: submissionDetailInclude,
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

    if (input.intent === "unpublish" && actor.role !== "ADMIN") {
      throw new Error("Only admins can unpublish an audit.");
    }

    if (
      input.intent === "unpublish" &&
      submission.followUps.some((item) => lockedFollowUpStatuses.includes(item.status))
    ) {
      throw new Error(
        "This audit cannot be unpublished because follow-up has already progressed.",
      );
    }

    const linkedPlans = await tx.servicePlan.findMany({
      where: {
        slug: {
          in: input.selectedPlanSlugs,
        },
      },
    });

    const now = new Date();
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
        scope: input.scope,
        title: input.title,
        executiveSummary: input.executiveSummary || null,
        clientSummary: input.clientSummary || null,
        internalSummary: input.internalSummary || null,
        strengths: parseLineItems(input.strengthsText),
        improvementOpportunities: parseLineItems(input.improvementText),
        nextSteps: parseLineItems(input.nextStepsText),
        actionPlan: parseLineItems(input.actionPlanText),
        progressPercent: input.progressPercent,
        implementationRecommendation: input.implementationRecommendation,
        implementationNotes: input.implementationNotes || null,
        startedAt: input.progressPercent > 0 ? now : null,
        completedAt: input.progressPercent >= 100 ? now : null,
        publishedAt: input.intent === "publish" ? now : null,
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
        scope: input.scope,
        title: input.title,
        executiveSummary: input.executiveSummary || null,
        clientSummary: input.clientSummary || null,
        internalSummary: input.internalSummary || null,
        strengths: parseLineItems(input.strengthsText),
        improvementOpportunities: parseLineItems(input.improvementText),
        nextSteps: parseLineItems(input.nextStepsText),
        actionPlan: parseLineItems(input.actionPlanText),
        progressPercent: input.progressPercent,
        implementationRecommendation: input.implementationRecommendation,
        implementationNotes: input.implementationNotes || null,
        startedAt:
          input.progressPercent > 0 ? submission.audit?.startedAt ?? now : null,
        completedAt: input.progressPercent >= 100 ? now : null,
        publishedAt:
          input.intent === "publish"
            ? now
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

    await tx.auditChecklistItem.deleteMany({
      where: {
        auditId: audit.id,
      },
    });

    if (input.checklistItems.length) {
      await tx.auditChecklistItem.createMany({
        data: input.checklistItems.map((item, index) => ({
          auditId: audit.id,
          category: item.category,
          title: item.title,
          status: item.status,
          notes: item.notes || null,
          recommendation: item.recommendation || null,
          displayOrder: index,
        })),
      });
    }

    await tx.auditEvidence.deleteMany({
      where: {
        auditId: audit.id,
      },
    });

    if (input.evidence.length) {
      await tx.auditEvidence.createMany({
        data: input.evidence.map((item, index) => ({
          auditId: audit.id,
          category: item.category ?? null,
          label: item.label,
          assetUrl: item.assetUrl || null,
          notes: item.notes || null,
          stage: item.stage,
          clientVisible: item.clientVisible,
          displayOrder: index,
        })),
      });
    }

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
        updatedAt: now,
      },
    });

    await touchBusinessActivity(tx, {
      businessId: submission.businessId,
      status: nextSubmissionStatus,
      lifecycleStage: lifecycleStageFromAudit(
        input.scope,
        input.intent === "publish",
      ),
      publishedAt:
        input.intent === "publish"
          ? now
          : input.intent === "unpublish"
            ? null
            : undefined,
      lastClientContactAt: input.intent === "publish" ? now : undefined,
    });

    if (input.intent === "publish") {
      const existingQueuedFollowUp = await tx.followUp.findFirst({
        where: {
          presenceCheckId: submission.id,
          status: {
            in: [FollowUpStatus.QUEUED, FollowUpStatus.SCHEDULED],
          },
        },
      });

      if (!existingQueuedFollowUp) {
        await tx.followUp.create({
          data: {
            businessId: submission.businessId,
            presenceCheckId: submission.id,
            status: FollowUpStatus.QUEUED,
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
          ? input.scope === AuditScope.COMPREHENSIVE
            ? "Your comprehensive Virtura Presence audit is now published"
            : "Your consultant-reviewed audit is now published"
          : "Audit draft updated",
      payload: {
        intent: input.intent,
        selectedPlanSlugs: input.selectedPlanSlugs,
        scope: input.scope,
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
      include: {
        business: true,
        audit: true,
      },
    });

    if (!submission) {
      throw new Error("Submission not found.");
    }

    const now = new Date();
    const updated = await tx.presenceCheck.update({
      where: {
        id: input.submissionId,
      },
      data: {
        status: input.status,
      },
    });

    let nextLifecycleStage = lifecycleStageFromSubmissionStatus(
      input.status,
      submission.business.lifecycleStage,
    );

    if (
      submission.audit?.scope === AuditScope.COMPREHENSIVE &&
      input.status === SubmissionStatus.IN_REVIEW
    ) {
      nextLifecycleStage = BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS;
    }

    await touchBusinessActivity(tx, {
      businessId: submission.businessId,
      status: input.status,
      lifecycleStage: nextLifecycleStage,
      lastClientContactAt:
        input.status === SubmissionStatus.FOLLOW_UP_SENT ? now : undefined,
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
                sentAt: now,
              },
            })
          : await tx.followUp.create({
              data: {
                businessId: submission.businessId,
                presenceCheckId: submission.id,
                status: FollowUpStatus.SENT,
                sentAt: now,
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

  const note = await prisma.internalNote.create({
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

  await prisma.business.update({
    where: {
      id: submission.businessId,
    },
    data: {
      lastActivityAt: new Date(),
    },
  });

  return note;
}

export async function updateBusinessLifecycle(input: {
  businessId: string;
  lifecycleStage: BusinessLifecycleStage;
}) {
  const business = await prisma.business.findUnique({
    where: {
      id: input.businessId,
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  return prisma.business.update({
    where: {
      id: input.businessId,
    },
    data: {
      lifecycleStage: input.lifecycleStage,
      status: businessStatusForLifecycleStage(input.lifecycleStage, business.status),
      lastActivityAt: new Date(),
    },
  });
}

export async function sendWorkspaceNotification(
  input: WorkspaceNotificationActionInput,
  actor: { id: string },
) {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const business = await tx.business.findUnique({
      where: {
        id: input.businessId,
      },
    });

    if (!business) {
      throw new Error("Business not found.");
    }

    const submission = await getSubmissionForNotification(tx, input);

    if (!submission) {
      throw new Error("A matching submission could not be found for this email action.");
    }

    const audit = submission.audit;
    const recipient = submission.reportEmail || submission.contactEmail || business.primaryEmail;
    let eventId: string | null = null;

    if (input.kind === "quick_report") {
      const event = await recordNotificationEvent(tx, {
        type: "SUBMISSION_CREATED",
        status: NotificationStatus.PENDING,
        businessId: business.id,
        presenceCheckId: submission.id,
        userId: actor.id,
        recipient,
        channel: "email",
        subject: `Your quick review for ${submission.businessName} is ready`,
      });
      eventId = event.id;
    }

    if (input.kind === "audit_available") {
      if (!audit) {
        throw new Error("Publish or save an audit before sending the audit-available email.");
      }

      const event = await recordNotificationEvent(tx, {
        type: "AUDIT_PUBLISHED",
        status: NotificationStatus.PENDING,
        businessId: business.id,
        presenceCheckId: submission.id,
        auditId: audit.id,
        userId: actor.id,
        recipient,
        channel: "email",
        subject: "Your consultant-reviewed Virtura Presence audit is ready",
      });
      eventId = event.id;
    }

    if (input.kind === "comprehensive_ready") {
      if (!audit || audit.scope !== AuditScope.COMPREHENSIVE) {
        throw new Error(
          "A saved comprehensive audit is required before this notification can be sent.",
        );
      }

      const event = await recordNotificationEvent(tx, {
        type: "AUDIT_PUBLISHED",
        status: NotificationStatus.PENDING,
        businessId: business.id,
        presenceCheckId: submission.id,
        auditId: audit.id,
        userId: actor.id,
        recipient,
        channel: "email",
        subject: "Your comprehensive Virtura Presence audit is ready",
        payload: {
          scope: AuditScope.COMPREHENSIVE,
        },
      });
      eventId = event.id;
    }

    if (input.kind === "follow_up") {
      const latestFollowUp = submission.followUps[0];
      const followUp =
        latestFollowUp
          ? await tx.followUp.update({
              where: {
                id: latestFollowUp.id,
              },
              data: {
                status:
                  latestFollowUp.status === FollowUpStatus.SCHEDULED
                    ? FollowUpStatus.SCHEDULED
                    : FollowUpStatus.QUEUED,
                sentAt: null,
              },
            })
          : await tx.followUp.create({
              data: {
                businessId: business.id,
                presenceCheckId: submission.id,
                status: FollowUpStatus.QUEUED,
                channel: "email",
                subject: "A quick follow-up from Virtura Presence",
                notes:
                  "Checking in after the audit to offer practical next-step support.",
              },
            });

      const event = await recordNotificationEvent(tx, {
        type: "FOLLOW_UP_SENT",
        status: NotificationStatus.PENDING,
        businessId: business.id,
        presenceCheckId: submission.id,
        auditId: audit?.id,
        userId: actor.id,
        recipient,
        channel: "email",
        subject: followUp.subject ?? "A quick follow-up from Virtura Presence",
        payload: {
          followUpId: followUp.id,
        },
      });
      eventId = event.id;
    }

    if (!eventId) {
      throw new Error("Notification action could not be created.");
    }

    return {
      eventId,
    };
  });

  const result = await processWorkspaceNotification({
    eventId: transactionResult.eventId,
    kind: input.kind,
  });

  return {
    eventId: transactionResult.eventId,
    delivery: result,
  };
}

export async function retryWorkspaceNotificationEvent(input: {
  eventId: string;
}) {
  const event = await prisma.notificationEvent.findUnique({
    where: {
      id: input.eventId,
    },
    select: {
      id: true,
      type: true,
      status: true,
      businessId: true,
      payload: true,
    },
  });

  if (!event?.businessId) {
    throw new Error("Notification event not found.");
  }

  const payload = notificationPayloadRecord(event.payload);
  const kind: WorkspaceNotificationActionInput["kind"] =
    event.type === "SUBMISSION_CREATED"
      ? "quick_report"
      : event.type === "FOLLOW_UP_SENT"
        ? "follow_up"
        : payload.scope === AuditScope.COMPREHENSIVE
          ? "comprehensive_ready"
          : "audit_available";

  const result = await processWorkspaceNotification({
    eventId: event.id,
    kind,
  });

  return {
    eventId: event.id,
    delivery: result,
  };
}

export async function getFallbackPlanCatalog() {
  const plans = await prisma.servicePlan.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return plans.length ? plans : servicePlans;
}
