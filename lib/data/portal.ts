import { compare, hash } from "bcryptjs";
import {
  BusinessLifecycleStage,
  NotificationStatus,
  Prisma,
  SubmissionStatus,
} from "@prisma/client";

import { dispatchNotificationEvents } from "@/lib/notification-delivery";
import { recordNotificationEvent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { parseLineItems } from "@/lib/text";
import type {
  ChangePasswordInput,
  ComprehensiveReportRequestInput,
  ComprehensiveReportRequestStatusInput,
  PortalProfileInput,
} from "@/lib/validations/portal";

const portalSubmissionInclude = Prisma.validator<Prisma.PresenceCheckInclude>()({
  business: {
    include: {
      comprehensiveRequests: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  },
  categoryScores: {
    orderBy: {
      displayOrder: "asc",
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
});

export async function getPortalDashboardData(userId: string) {
  const submissions = await prisma.presenceCheck.findMany({
    where: {
      OR: [{ submittedById: userId }, { business: { primaryContactId: userId } }],
    },
    orderBy: {
      submittedAt: "desc",
    },
    include: portalSubmissionInclude,
  });

  const latestSubmission = submissions[0] ?? null;
  const latestBusiness = latestSubmission?.business ?? null;
  const trend = submissions
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
    submissions,
    latestSubmission,
    latestBusiness,
    trend,
    latestPublishedAudit:
      submissions.find((submission) => submission.audit?.status === "PUBLISHED")?.audit ?? null,
  };
}

export async function getPortalProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      ownedBusinesses: {
        orderBy: {
          latestSubmittedAt: "desc",
        },
        take: 1,
      },
      submittedPresenceChecks: {
        orderBy: {
          submittedAt: "desc",
        },
        take: 1,
        include: {
          business: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const business =
    user.ownedBusinesses[0] ??
    user.submittedPresenceChecks[0]?.business ??
    null;

  return {
    user,
    business,
  };
}

export async function updatePortalProfile(userId: string, input: PortalProfileInput) {
  const profile = await getPortalProfileData(userId);

  if (!profile?.business || profile.business.id !== input.businessId) {
    throw new Error("That business profile could not be edited from this account.");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        name: input.accountName,
        phone: input.phone || null,
        companyName: input.businessName,
      },
    });

    const business = await tx.business.update({
      where: {
        id: input.businessId,
      },
      data: {
        name: input.businessName,
        ownerName: input.ownerName,
        businessCategory: input.businessCategory,
        city: input.city,
        state: input.state,
        serviceArea: input.serviceArea,
        primaryEmail: input.contactEmail,
        primaryPhone: input.phone || null,
        websiteUrl: input.websiteUrl?.trim() || null,
        googleBusinessProfileUrl: input.googleBusinessProfileUrl?.trim() || null,
        socialLinks: {
          facebook: input.facebookUrl?.trim() || null,
          instagram: input.instagramUrl?.trim() || null,
          linkedin: input.linkedinUrl?.trim() || null,
          youtube: input.youtubeUrl?.trim() || null,
          nextdoor: input.nextdoorUrl?.trim() || null,
        },
        description: input.businessDescription?.trim() || null,
        reviewCount: input.reviewCount ?? null,
        averageRating: input.averageRating ?? null,
        reviewRequestCadence: input.reviewRequestCadence,
        runsAdvertising: input.runsAdvertising,
        goals: parseLineItems(input.goalsText),
      },
    });

    return {
      user,
      business,
    };
  });
}

export async function changePortalPassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.passwordHash) {
    throw new Error("Password changes are only available for database-backed accounts.");
  }

  const matches = await compare(input.currentPassword, user.passwordHash);

  if (!matches) {
    throw new Error("The current password did not match.");
  }

  const passwordHash = await hash(input.newPassword, 10);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });

  return {
    success: true,
  };
}

export async function createComprehensiveReportRequest(
  userId: string | undefined,
  input: ComprehensiveReportRequestInput,
) {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const notificationEventIds: string[] = [];
    const submission = await tx.presenceCheck.findUnique({
      where: {
        id: input.submissionId,
      },
      include: {
        business: true,
        comprehensiveRequests: {
          where: {
            status: {
              in: ["REQUESTED", "ACKNOWLEDGED", "IN_PROGRESS"],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!submission) {
      throw new Error("That presence check no longer exists.");
    }

    const existingRequest = submission.comprehensiveRequests[0];

    if (existingRequest) {
      return {
        request: existingRequest,
        notificationEventIds,
      };
    }

    const request = await tx.comprehensiveReportRequest.create({
      data: {
        businessId: submission.businessId,
        presenceCheckId: submission.id,
        requestedById: userId ?? null,
        note: input.note?.trim() || null,
      },
    });

    await tx.business.update({
      where: {
        id: submission.businessId,
      },
      data: {
        lifecycleStage: BusinessLifecycleStage.COMPREHENSIVE_AUDIT_REQUESTED,
        lastActivityAt: new Date(),
      },
    });

    const event = await recordNotificationEvent(tx, {
      type: "COMPREHENSIVE_REPORT_REQUESTED",
      status: NotificationStatus.LOGGED,
      businessId: submission.businessId,
      presenceCheckId: submission.id,
      userId,
      channel: "log",
      recipient: submission.contactEmail,
      subject: "Comprehensive report requested",
      payload: {
        requestId: request.id,
        note: input.note?.trim() || null,
      },
    });
    notificationEventIds.push(event.id);

    return {
      request,
      notificationEventIds,
    };
  });

  await dispatchNotificationEvents(transactionResult.notificationEventIds);

  return transactionResult.request;
}

export async function updateComprehensiveReportRequestStatus(
  input: ComprehensiveReportRequestStatusInput,
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.comprehensiveReportRequest.update({
      where: {
        id: input.requestId,
      },
      data: {
        status: input.status,
        resolvedAt:
          input.status === "COMPLETED" || input.status === "DECLINED"
            ? new Date()
            : null,
      },
    });

    await tx.business.update({
      where: {
        id: request.businessId,
      },
      data: {
        lifecycleStage:
          input.status === "REQUESTED"
            ? BusinessLifecycleStage.COMPREHENSIVE_AUDIT_REQUESTED
            : input.status === "ACKNOWLEDGED" || input.status === "IN_PROGRESS"
              ? BusinessLifecycleStage.COMPREHENSIVE_AUDIT_IN_PROGRESS
              : input.status === "COMPLETED"
                ? BusinessLifecycleStage.AUDIT_PUBLISHED
                : BusinessLifecycleStage.FREE_AUDIT_REVIEWED,
        status:
          input.status === "COMPLETED"
            ? SubmissionStatus.PUBLISHED
            : input.status === "DECLINED"
              ? SubmissionStatus.IN_REVIEW
              : undefined,
        lastActivityAt: new Date(),
      },
    });

    return request;
  });
}
