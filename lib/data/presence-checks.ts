import {
  AdvertisingCadence,
  GoogleBusinessProfileStatus,
  NotificationStatus,
  ReviewRequestCadence,
  ReviewStrength,
  ScoreTier,
  SocialPresenceLevel,
  SubmissionStatus,
  WebsiteStatus,
  type Prisma,
} from "@prisma/client";

import { attachEmailOwnedRecordsToUser } from "@/lib/data/user-links";
import { dispatchNotificationEvents } from "@/lib/notification-delivery";
import { createUserActionToken, recordNotificationEvent } from "@/lib/notifications";
import { buildQuickScore, type QuickScoreTier } from "@/lib/presence/score";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, slugify } from "@/lib/text";
import type { PresenceCheckInput } from "@/lib/validations/presence-check";

type SubmissionCreateOptions = {
  currentUserId?: string;
};

type ReportDeliveryInput = {
  submissionId: string;
  reportEmail: string;
  currentUserId?: string;
};

export type PresenceCheckSubmissionResult = {
  submissionId: string;
  businessId: string;
  score: number;
  scoreTier: ScoreTier;
  tierLabel: ReturnType<typeof buildQuickScore>["tier"];
  summary: string;
  encouragement: string;
  strengths: string[];
  improvements: string[];
  categories: ReturnType<typeof buildQuickScore>["categories"];
  suggestedPlanSlugs: string[];
  claimToken?: string;
  nextStep: "portal" | "sign-in" | "claim";
};

function toScoreTierEnum(label: QuickScoreTier) {
  if (label === "Strong online presence") {
    return ScoreTier.STRONG_ONLINE_PRESENCE;
  }

  if (label === "Solid foundation with improvement opportunities") {
    return ScoreTier.SOLID_FOUNDATION_IMPROVEMENTS;
  }

  if (label === "Basic foundation with clear gaps") {
    return ScoreTier.BASIC_FOUNDATION_CLEAR_GAPS;
  }

  if (label === "Early-stage presence") {
    return ScoreTier.EARLY_STAGE_PRESENCE;
  }

  return ScoreTier.LIMITED_FOUNDATION;
}

function toWebsiteStatus(value: PresenceCheckInput["websiteStatus"]) {
  switch (value) {
    case "in-progress":
      return WebsiteStatus.IN_PROGRESS;
    case "basic":
      return WebsiteStatus.BASIC;
    case "mostly-complete":
      return WebsiteStatus.MOSTLY_COMPLETE;
    case "polished":
      return WebsiteStatus.POLISHED;
    default:
      return WebsiteStatus.NONE;
  }
}

function toGoogleBusinessStatus(value: PresenceCheckInput["googleBusinessProfileStatus"]) {
  switch (value) {
    case "not-sure":
      return GoogleBusinessProfileStatus.NOT_SURE;
    case "claimed-incomplete":
      return GoogleBusinessProfileStatus.CLAIMED_INCOMPLETE;
    case "claimed-mostly-complete":
      return GoogleBusinessProfileStatus.CLAIMED_MOSTLY_COMPLETE;
    case "active":
      return GoogleBusinessProfileStatus.ACTIVE;
    default:
      return GoogleBusinessProfileStatus.NONE;
  }
}

function toSocialPresenceLevel(value: PresenceCheckInput["socialPresenceLevel"]) {
  switch (value) {
    case "one-occasional":
      return SocialPresenceLevel.ONE_OCCASIONAL;
    case "one-active":
      return SocialPresenceLevel.ONE_ACTIVE;
    case "multiple-active":
      return SocialPresenceLevel.MULTIPLE_ACTIVE;
    default:
      return SocialPresenceLevel.NONE;
  }
}

function toAdvertisingCadence(value: PresenceCheckInput["runsAdvertising"]) {
  if (value === "yes") {
    return AdvertisingCadence.YES;
  }

  if (value === "occasionally") {
    return AdvertisingCadence.OCCASIONALLY;
  }

  return AdvertisingCadence.NO;
}

function toReviewStrength(value: PresenceCheckInput["reviewStrength"]) {
  switch (value) {
    case "few":
      return ReviewStrength.FEW;
    case "some":
      return ReviewStrength.SOME;
    case "strong":
      return ReviewStrength.STRONG;
    default:
      return ReviewStrength.NONE;
  }
}

function toReviewRequestCadence(value: PresenceCheckInput["reviewRequestCadence"]) {
  switch (value) {
    case "rarely":
      return ReviewRequestCadence.RARELY;
    case "sometimes":
      return ReviewRequestCadence.SOMETIMES;
    case "regularly":
      return ReviewRequestCadence.REGULARLY;
    default:
      return ReviewRequestCadence.NEVER;
  }
}

async function createUniqueBusinessSlug(
  tx: Prisma.TransactionClient,
  input: Pick<PresenceCheckInput, "businessName" | "city" | "state">,
) {
  const baseSlug = slugify(`${input.businessName}-${input.city}-${input.state}`) || "virtura-business";
  let slug = baseSlug;
  let counter = 1;

  while (await tx.business.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

async function findLinkedUser(
  tx: Prisma.TransactionClient,
  email: string,
  currentUserId?: string,
) {
  if (currentUserId) {
    const currentUser = await tx.user.findUnique({
      where: { id: currentUserId },
    });

    if (currentUser) {
      return currentUser;
    }
  }

  return tx.user.findUnique({
    where: {
      email,
    },
  });
}

async function findMatchingBusiness(
  tx: Prisma.TransactionClient,
  input: PresenceCheckInput,
  email: string,
  linkedUserId?: string,
) {
  if (linkedUserId) {
    const linkedBusiness = await tx.business.findFirst({
      where: {
        primaryContactId: linkedUserId,
        name: { equals: input.businessName, mode: "insensitive" },
      },
    });

    if (linkedBusiness) {
      return linkedBusiness;
    }
  }

  const businessByEmail = await tx.business.findFirst({
    where: {
      primaryEmail: email,
      name: { equals: input.businessName, mode: "insensitive" },
      city: { equals: input.city, mode: "insensitive" },
      state: { equals: input.state, mode: "insensitive" },
    },
  });

  if (businessByEmail) {
    return businessByEmail;
  }

  if (input.websiteUrl) {
    return tx.business.findFirst({
      where: {
        websiteUrl: input.websiteUrl,
      },
    });
  }

  return null;
}

function getSubmissionNextStep(input: {
  currentUserId?: string;
  linkedUserId?: string | null;
  linkedUserHasPassword?: boolean | null;
}) {
  if (input.currentUserId) {
    return "portal" as const;
  }

  if (input.linkedUserId && input.linkedUserHasPassword) {
    return "sign-in" as const;
  }

  return "claim" as const;
}

function buildBusinessUpdateData(
  input: PresenceCheckInput,
  email: string,
  quickScore: ReturnType<typeof buildQuickScore>,
  scoreTier: ScoreTier,
) {
  return {
    name: input.businessName,
    ownerName: input.ownerName,
    businessCategory: input.businessCategory,
    city: input.city,
    state: input.state,
    serviceArea: input.serviceArea,
    primaryEmail: email,
    primaryPhone: input.phone || null,
    websiteUrl: input.websiteUrl || null,
    googleBusinessProfileUrl: input.googleBusinessProfileUrl || null,
    socialProfiles: input.socialPlatforms,
    discoveryChannels: input.discoveryChannels,
    goals: input.goals,
    description: input.notes || null,
    websiteStatus: toWebsiteStatus(input.websiteStatus),
    googleBusinessProfileStatus: toGoogleBusinessStatus(input.googleBusinessProfileStatus),
    reviewStrength: toReviewStrength(input.reviewStrength),
    reviewRequestCadence: toReviewRequestCadence(input.reviewRequestCadence),
    socialPresenceLevel: toSocialPresenceLevel(input.socialPresenceLevel),
    runsAdvertising: toAdvertisingCadence(input.runsAdvertising),
    reviewCount: input.reviewCount ?? null,
    averageRating: input.averageRating ?? null,
    notes: input.notes || null,
    latestSubmittedAt: new Date(),
    quickScore: quickScore.score,
    quickTier: scoreTier,
    quickSummary: quickScore.summary,
    status: SubmissionStatus.SUBMITTED,
  };
}

export async function createPresenceCheckSubmission(
  input: PresenceCheckInput,
  options: SubmissionCreateOptions = {},
): Promise<PresenceCheckSubmissionResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedInput = {
    ...input,
    email: normalizedEmail,
  };
  const quickScore = buildQuickScore(normalizedInput);
  const scoreTier = toScoreTierEnum(quickScore.tier);

  const transactionResult = await prisma.$transaction(async (tx) => {
    const linkedUser = await findLinkedUser(tx, normalizedEmail, options.currentUserId);
    const existingBusiness = await findMatchingBusiness(
      tx,
      normalizedInput,
      normalizedEmail,
      linkedUser?.id,
    );

    const businessData = buildBusinessUpdateData(
      normalizedInput,
      normalizedEmail,
      quickScore,
      scoreTier,
    );

    const business =
      existingBusiness ??
      (await tx.business.create({
        data: {
          slug: await createUniqueBusinessSlug(tx, normalizedInput),
          leadSource: "presence-check",
          ...businessData,
          primaryContactId: linkedUser?.id ?? null,
        } as Prisma.BusinessUncheckedCreateInput,
      }));

    if (existingBusiness) {
      await tx.business.update({
        where: { id: existingBusiness.id },
        data: {
          ...businessData,
          primaryContactId: existingBusiness.primaryContactId ?? linkedUser?.id ?? null,
        } as Prisma.BusinessUncheckedUpdateInput,
      });
    }

    const submission = await tx.presenceCheck.create({
      data: {
        businessId: business.id,
        submittedById: linkedUser?.id,
        assignedConsultantId: business.assignedConsultantId,
        status: SubmissionStatus.SUBMITTED,
        businessName: normalizedInput.businessName,
        ownerName: normalizedInput.ownerName,
        contactEmail: normalizedEmail,
        contactPhone: normalizedInput.phone || null,
        businessCategory: normalizedInput.businessCategory,
        city: normalizedInput.city,
        state: normalizedInput.state,
        serviceArea: normalizedInput.serviceArea,
        websiteStatus: toWebsiteStatus(normalizedInput.websiteStatus),
        websiteUrl: normalizedInput.websiteUrl || null,
        googleBusinessProfileStatus: toGoogleBusinessStatus(
          normalizedInput.googleBusinessProfileStatus,
        ),
        googleBusinessProfileUrl: normalizedInput.googleBusinessProfileUrl || null,
        socialPlatforms: normalizedInput.socialPlatforms,
        socialPresenceLevel: toSocialPresenceLevel(normalizedInput.socialPresenceLevel),
        runsAdvertising: toAdvertisingCadence(normalizedInput.runsAdvertising),
        discoveryChannels: normalizedInput.discoveryChannels,
        reviewStrength: toReviewStrength(normalizedInput.reviewStrength),
        reviewRequestCadence: toReviewRequestCadence(normalizedInput.reviewRequestCadence),
        reviewCount: normalizedInput.reviewCount ?? null,
        averageRating: normalizedInput.averageRating ?? null,
        desiredOutcomes: normalizedInput.goals,
        rawNotes: normalizedInput.notes || null,
        reportEmail: normalizedEmail,
        score: quickScore.score,
        scoreTier,
        summary: quickScore.summary,
        encouragement: quickScore.encouragement,
        strengths: quickScore.strengths,
        improvementAreas: quickScore.improvements,
        categoryScores: {
          create: quickScore.categories.map((category, index) => ({
            category: category.key,
            score: category.score,
            note: category.note,
            displayOrder: index,
          })),
        },
      },
    });

    if (linkedUser?.id) {
      await attachEmailOwnedRecordsToUser(tx, {
        userId: linkedUser.id,
        email: normalizedEmail,
      });
    }

    return {
      submissionId: submission.id,
      businessId: business.id,
      score: quickScore.score,
      scoreTier,
      tierLabel: quickScore.tier,
      summary: quickScore.summary,
      encouragement: quickScore.encouragement,
      strengths: quickScore.strengths,
      improvements: quickScore.improvements,
      categories: quickScore.categories,
      suggestedPlanSlugs: quickScore.suggestedPlanSlugs,
      claimToken: undefined,
      nextStep: getSubmissionNextStep({
        currentUserId: options.currentUserId,
        linkedUserId: linkedUser?.id,
        linkedUserHasPassword: Boolean(linkedUser?.passwordHash),
      }),
    } satisfies PresenceCheckSubmissionResult;
  });

  return transactionResult;
}

export async function deliverPresenceCheckReport(
  input: ReportDeliveryInput,
) {
  const normalizedEmail = normalizeEmail(input.reportEmail);

  const transactionResult = await prisma.$transaction(async (tx) => {
    const notificationEventIds: string[] = [];
    const submission = await tx.presenceCheck.findUnique({
      where: {
        id: input.submissionId,
      },
      include: {
        business: true,
      },
    });

    if (!submission) {
      throw new Error("That presence check could not be found.");
    }

    const linkedUser = await findLinkedUser(tx, normalizedEmail, input.currentUserId);
    const nextStep = getSubmissionNextStep({
      currentUserId: input.currentUserId,
      linkedUserId: linkedUser?.id,
      linkedUserHasPassword: Boolean(linkedUser?.passwordHash),
    });

    await tx.presenceCheck.update({
      where: {
        id: submission.id,
      },
      data: {
        contactEmail: normalizedEmail,
        reportEmail: normalizedEmail,
        reportSentAt: new Date(),
        submittedById: input.currentUserId
          ? submission.submittedById ?? input.currentUserId
          : linkedUser?.id ?? submission.submittedById,
      },
    });

    await tx.business.update({
      where: {
        id: submission.businessId,
      },
      data: {
        primaryEmail: normalizedEmail,
        primaryContactId:
          input.currentUserId
            ? submission.business.primaryContactId
            : submission.business.primaryContactId ?? linkedUser?.id ?? null,
      },
    });

    if (linkedUser?.id) {
      await attachEmailOwnedRecordsToUser(tx, {
        userId: linkedUser.id,
        email: normalizedEmail,
      });
    }

    let claimToken:
      | {
          token: string;
        }
      | null = null;

    if (nextStep === "claim") {
      claimToken = await createUserActionToken(tx, {
        type: "CLAIM_SUBMISSION",
        email: normalizedEmail,
        userId: linkedUser?.id,
        presenceCheckId: submission.id,
        expiresInHours: 72,
      });
    }

    const event = await recordNotificationEvent(tx, {
      type: claimToken ? "CLAIM_LINK_CREATED" : "SUBMISSION_CREATED",
      status: NotificationStatus.PENDING,
      businessId: submission.businessId,
      presenceCheckId: submission.id,
      userId: linkedUser?.id ?? input.currentUserId,
      channel: "email",
      recipient: normalizedEmail,
      subject: claimToken
        ? `Create portal access for ${submission.businessName}`
        : `Your quick review for ${submission.businessName} is ready`,
      payload: claimToken
        ? {
            token: claimToken.token,
            type: "claim_submission",
          }
        : {
            score: submission.score,
            scoreTier: submission.scoreTier,
            businessName: submission.businessName,
          },
    });
    notificationEventIds.push(event.id);

    return {
      nextStep,
      claimToken: claimToken?.token,
      notificationEventIds,
      reportEmail: normalizedEmail,
    };
  });

  await dispatchNotificationEvents(transactionResult.notificationEventIds);

  return {
    nextStep: transactionResult.nextStep,
    claimToken: transactionResult.claimToken,
    reportEmail: transactionResult.reportEmail,
  };
}
