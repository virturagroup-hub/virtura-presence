import {
  AdvertisingCadence,
  NotificationStatus,
  ReviewCollectionLevel,
  ScoreTier,
  SubmissionStatus,
  type Prisma,
} from "@prisma/client";

import { attachEmailOwnedRecordsToUser } from "@/lib/data/user-links";
import { dispatchNotificationEvents } from "@/lib/notification-delivery";
import { createUserActionToken, recordNotificationEvent } from "@/lib/notifications";
import { buildQuickScore } from "@/lib/presence/score";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, slugify } from "@/lib/text";
import type { PresenceCheckInput } from "@/lib/validations/presence-check";

type SubmissionCreateOptions = {
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

function toScoreTierEnum(label: ReturnType<typeof buildQuickScore>["tier"]) {
  if (label === "Strong footing") {
    return ScoreTier.STRONG_FOOTING;
  }

  if (label === "Promising with clear upside") {
    return ScoreTier.PROMISING_UPSIDE;
  }

  return ScoreTier.FOCUSED_ATTENTION;
}

function toWebsiteValue(value: PresenceCheckInput["hasWebsite"]) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}

function toGoogleBusinessValue(value: PresenceCheckInput["usesGoogleBusinessProfile"]) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
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

function toReviewCollectionLevel(value: PresenceCheckInput["collectsReviews"]) {
  if (value === "yes") {
    return ReviewCollectionLevel.YES;
  }

  if (value === "somewhat") {
    return ReviewCollectionLevel.SOMEWHAT;
  }

  return ReviewCollectionLevel.NOT_YET;
}

async function createUniqueBusinessSlug(
  tx: Prisma.TransactionClient,
  input: PresenceCheckInput,
) {
  const baseSlug = slugify(`${input.businessName}-${input.city}-${input.state}`);
  let slug = baseSlug || "virtura-business";
  let counter = 1;

  while (await tx.business.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
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

export async function createPresenceCheckSubmission(
  input: PresenceCheckInput,
  options: SubmissionCreateOptions = {},
): Promise<PresenceCheckSubmissionResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const quickScore = buildQuickScore({
    ...input,
    email: normalizedEmail,
  });
  const scoreTier = toScoreTierEnum(quickScore.tier);

  const transactionResult = await prisma.$transaction(async (tx) => {
    const notificationEventIds: string[] = [];
    const linkedUser =
      (options.currentUserId
        ? await tx.user.findUnique({ where: { id: options.currentUserId } })
        : null) ??
      (await tx.user.findUnique({
        where: { email: normalizedEmail },
      }));

    const existingBusiness = await findMatchingBusiness(
      tx,
      input,
      normalizedEmail,
      linkedUser?.id,
    );

    const business =
      existingBusiness ??
      (await tx.business.create({
        data: {
          slug: await createUniqueBusinessSlug(tx, input),
          name: input.businessName,
          ownerName: input.ownerName,
          businessCategory: input.businessCategory,
          city: input.city,
          state: input.state,
          serviceArea: input.serviceArea,
          primaryEmail: normalizedEmail,
          primaryPhone: input.phone,
          websiteUrl: input.websiteUrl || null,
          googleBusinessProfileUrl: input.googleBusinessProfileUrl || null,
          socialProfiles: input.socialPlatforms,
          discoveryChannels: input.discoveryChannels,
          goals: input.goals,
          notes: input.notes,
          primaryContactId: linkedUser?.id,
          assignedConsultantId: linkedUser?.role === "CONSULTANT" ? linkedUser.id : null,
          latestSubmittedAt: new Date(),
          quickScore: quickScore.score,
          quickTier: scoreTier,
          quickSummary: quickScore.summary,
        },
      }));

    if (existingBusiness) {
      await tx.business.update({
        where: { id: existingBusiness.id },
        data: {
          name: input.businessName,
          ownerName: input.ownerName,
          businessCategory: input.businessCategory,
          city: input.city,
          state: input.state,
          serviceArea: input.serviceArea,
          primaryEmail: normalizedEmail,
          primaryPhone: input.phone,
          websiteUrl: input.websiteUrl || null,
          googleBusinessProfileUrl: input.googleBusinessProfileUrl || null,
          socialProfiles: input.socialPlatforms,
          discoveryChannels: input.discoveryChannels,
          goals: input.goals,
          notes: input.notes,
          primaryContactId: existingBusiness.primaryContactId ?? linkedUser?.id,
          latestSubmittedAt: new Date(),
          quickScore: quickScore.score,
          quickTier: scoreTier,
          quickSummary: quickScore.summary,
          status: SubmissionStatus.SUBMITTED,
        },
      });
    }

    const submission = await tx.presenceCheck.create({
      data: {
        businessId: business.id,
        submittedById: linkedUser?.id,
        assignedConsultantId: business.assignedConsultantId,
        status: SubmissionStatus.SUBMITTED,
        businessName: input.businessName,
        ownerName: input.ownerName,
        contactEmail: normalizedEmail,
        contactPhone: input.phone || null,
        businessCategory: input.businessCategory,
        city: input.city,
        state: input.state,
        serviceArea: input.serviceArea,
        hasWebsite: toWebsiteValue(input.hasWebsite),
        websiteUrl: input.websiteUrl || null,
        usesGoogleBusinessProfile: toGoogleBusinessValue(
          input.usesGoogleBusinessProfile,
        ),
        googleBusinessProfileUrl: input.googleBusinessProfileUrl || null,
        socialPlatforms: input.socialPlatforms,
        runsAdvertising: toAdvertisingCadence(input.runsAdvertising),
        discoveryChannels: input.discoveryChannels,
        collectsReviews: toReviewCollectionLevel(input.collectsReviews),
        desiredOutcomes: input.goals,
        rawNotes: input.notes || null,
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
      include: {
        categoryScores: true,
      },
    });

    if (linkedUser?.id) {
      await attachEmailOwnedRecordsToUser(tx, {
        userId: linkedUser.id,
        email: normalizedEmail,
      });
    }

    const requiresClaim = !linkedUser || !linkedUser.passwordHash;
    const claimToken = requiresClaim
      ? await createUserActionToken(tx, {
          type: "CLAIM_SUBMISSION",
          email: normalizedEmail,
          userId: linkedUser?.id,
          presenceCheckId: submission.id,
          expiresInHours: 72,
        })
      : null;

    const submissionNotification = await recordNotificationEvent(tx, {
      type: "SUBMISSION_CREATED",
      status: claimToken ? NotificationStatus.LOGGED : NotificationStatus.PENDING,
      businessId: business.id,
      presenceCheckId: submission.id,
      userId: linkedUser?.id,
      channel: claimToken ? "log" : "email",
      recipient: normalizedEmail,
      subject: `Your quick review for ${input.businessName} is ready`,
      payload: {
        score: quickScore.score,
        scoreTier,
        businessName: input.businessName,
      },
    });
    if (!claimToken) {
      notificationEventIds.push(submissionNotification.id);
    }

    if (claimToken) {
      const claimNotification = await recordNotificationEvent(tx, {
        type: "CLAIM_LINK_CREATED",
        status: NotificationStatus.PENDING,
        businessId: business.id,
        presenceCheckId: submission.id,
        userId: linkedUser?.id,
        channel: "email",
        recipient: normalizedEmail,
        subject: `Create portal access for ${input.businessName}`,
        payload: {
          token: claimToken.token,
          type: "claim_submission",
        },
      });
      notificationEventIds.push(claimNotification.id);
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
      claimToken: claimToken?.token,
      nextStep: (
        options.currentUserId
          ? "portal"
          : claimToken
            ? "claim"
            : "sign-in"
      ) as PresenceCheckSubmissionResult["nextStep"],
      notificationEventIds,
    };
  });

  await dispatchNotificationEvents(transactionResult.notificationEventIds);

  return {
    submissionId: transactionResult.submissionId,
    businessId: transactionResult.businessId,
    score: transactionResult.score,
    scoreTier: transactionResult.scoreTier,
    tierLabel: transactionResult.tierLabel,
    summary: transactionResult.summary,
    encouragement: transactionResult.encouragement,
    strengths: transactionResult.strengths,
    improvements: transactionResult.improvements,
    categories: transactionResult.categories,
    suggestedPlanSlugs: transactionResult.suggestedPlanSlugs,
    claimToken: transactionResult.claimToken,
    nextStep: transactionResult.nextStep,
  };
}
