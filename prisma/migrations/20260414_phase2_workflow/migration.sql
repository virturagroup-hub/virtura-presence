-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'CONSULTANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'AWAITING_REVIEW', 'IN_REVIEW', 'PUBLISHED', 'FOLLOW_UP_SENT', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ScoreTier" AS ENUM ('STRONG_FOOTING', 'PROMISING_UPSIDE', 'FOCUSED_ATTENTION');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('DRAFT', 'INTERNAL_REVIEW', 'READY_TO_PUBLISH', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('WEBSITE_PRESENCE', 'GOOGLE_LOCAL_PRESENCE', 'REVIEWS_TRUST', 'SOCIAL_BRAND_ACTIVITY', 'CUSTOMER_ACTION_READINESS');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PROPOSED', 'PRESENTED', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('QUEUED', 'SCHEDULED', 'SENT', 'REPLIED', 'BOOKED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AdvertisingCadence" AS ENUM ('YES', 'OCCASIONALLY', 'NO');

-- CreateEnum
CREATE TYPE "ReviewCollectionLevel" AS ENUM ('YES', 'SOMEWHAT', 'NOT_YET');

-- CreateEnum
CREATE TYPE "NotificationEventType" AS ENUM ('SUBMISSION_CREATED', 'CLAIM_LINK_CREATED', 'ACCOUNT_LINKED', 'EMAIL_VERIFICATION_READY', 'AUDIT_SAVED', 'AUDIT_PUBLISHED', 'FOLLOW_UP_QUEUED', 'FOLLOW_UP_SENT', 'SERVICE_RECOMMENDED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'LOGGED', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "UserActionTokenType" AS ENUM ('CLAIM_SUBMISSION', 'VERIFY_EMAIL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "companyName" TEXT,
    "timezone" TEXT DEFAULT 'America/Chicago',
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerName" TEXT,
    "businessCategory" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "serviceArea" TEXT,
    "primaryEmail" TEXT NOT NULL,
    "primaryPhone" TEXT,
    "websiteUrl" TEXT,
    "googleBusinessProfileUrl" TEXT,
    "socialProfiles" JSONB,
    "discoveryChannels" JSONB,
    "goals" JSONB,
    "notes" TEXT,
    "leadSource" TEXT NOT NULL DEFAULT 'presence-check',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "quickScore" INTEGER,
    "quickTier" "ScoreTier",
    "quickSummary" TEXT,
    "primaryContactId" TEXT,
    "assignedConsultantId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latestSubmittedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresenceCheck" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "submittedById" TEXT,
    "assignedConsultantId" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "businessCategory" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "serviceArea" TEXT NOT NULL,
    "hasWebsite" BOOLEAN,
    "websiteUrl" TEXT,
    "usesGoogleBusinessProfile" BOOLEAN,
    "googleBusinessProfileUrl" TEXT,
    "socialPlatforms" JSONB,
    "runsAdvertising" "AdvertisingCadence" NOT NULL DEFAULT 'NO',
    "discoveryChannels" JSONB,
    "collectsReviews" "ReviewCollectionLevel" NOT NULL DEFAULT 'SOMEWHAT',
    "desiredOutcomes" JSONB,
    "rawNotes" TEXT,
    "score" INTEGER,
    "scoreTier" "ScoreTier",
    "summary" TEXT,
    "encouragement" TEXT,
    "strengths" JSONB,
    "improvementAreas" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresenceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresenceCheckCategory" (
    "id" TEXT NOT NULL,
    "presenceCheckId" TEXT NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "score" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresenceCheckCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualAudit" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "presenceCheckId" TEXT NOT NULL,
    "authorId" TEXT,
    "publishedById" TEXT,
    "status" "AuditStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL DEFAULT 'Manual Presence Audit',
    "executiveSummary" TEXT,
    "clientSummary" TEXT,
    "internalSummary" TEXT,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "improvementOpportunities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nextSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditSection" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "score" INTEGER,
    "headline" TEXT NOT NULL,
    "clientFacingNotes" TEXT NOT NULL,
    "internalNotes" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePlan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "idealFor" TEXT NOT NULL,
    "tierLabel" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "accentColor" TEXT,
    "deliverables" JSONB NOT NULL,
    "outcomes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanRecommendation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "presenceCheckId" TEXT,
    "auditId" TEXT,
    "servicePlanId" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PROPOSED',
    "clientVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalNote" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "presenceCheckId" TEXT,
    "authorId" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "presenceCheckId" TEXT,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'QUEUED',
    "channel" TEXT NOT NULL DEFAULT 'email',
    "subject" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "outcome" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" TEXT NOT NULL,
    "type" "NotificationEventType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "businessId" TEXT,
    "presenceCheckId" TEXT,
    "auditId" TEXT,
    "userId" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'log',
    "recipient" TEXT,
    "subject" TEXT,
    "payload" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActionToken" (
    "id" TEXT NOT NULL,
    "type" "UserActionTokenType" NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "presenceCheckId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActionToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "PresenceCheck_status_scoreTier_submittedAt_idx" ON "PresenceCheck"("status", "scoreTier", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "PresenceCheck_contactEmail_idx" ON "PresenceCheck"("contactEmail");

-- CreateIndex
CREATE INDEX "PresenceCheck_businessCategory_state_idx" ON "PresenceCheck"("businessCategory", "state");

-- CreateIndex
CREATE UNIQUE INDEX "PresenceCheckCategory_presenceCheckId_category_key" ON "PresenceCheckCategory"("presenceCheckId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ManualAudit_presenceCheckId_key" ON "ManualAudit"("presenceCheckId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditSection_auditId_category_key" ON "AuditSection"("auditId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePlan_slug_key" ON "ServicePlan"("slug");

-- CreateIndex
CREATE INDEX "PlanRecommendation_presenceCheckId_idx" ON "PlanRecommendation"("presenceCheckId");

-- CreateIndex
CREATE UNIQUE INDEX "UserActionToken_token_key" ON "UserActionToken"("token");

-- CreateIndex
CREATE INDEX "UserActionToken_email_type_idx" ON "UserActionToken"("email", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_assignedConsultantId_fkey" FOREIGN KEY ("assignedConsultantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceCheck" ADD CONSTRAINT "PresenceCheck_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceCheck" ADD CONSTRAINT "PresenceCheck_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceCheck" ADD CONSTRAINT "PresenceCheck_assignedConsultantId_fkey" FOREIGN KEY ("assignedConsultantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceCheckCategory" ADD CONSTRAINT "PresenceCheckCategory_presenceCheckId_fkey" FOREIGN KEY ("presenceCheckId") REFERENCES "PresenceCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualAudit" ADD CONSTRAINT "ManualAudit_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualAudit" ADD CONSTRAINT "ManualAudit_presenceCheckId_fkey" FOREIGN KEY ("presenceCheckId") REFERENCES "PresenceCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualAudit" ADD CONSTRAINT "ManualAudit_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualAudit" ADD CONSTRAINT "ManualAudit_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditSection" ADD CONSTRAINT "AuditSection_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "ManualAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRecommendation" ADD CONSTRAINT "PlanRecommendation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRecommendation" ADD CONSTRAINT "PlanRecommendation_presenceCheckId_fkey" FOREIGN KEY ("presenceCheckId") REFERENCES "PresenceCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRecommendation" ADD CONSTRAINT "PlanRecommendation_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "ManualAudit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRecommendation" ADD CONSTRAINT "PlanRecommendation_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "ServicePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_presenceCheckId_fkey" FOREIGN KEY ("presenceCheckId") REFERENCES "PresenceCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_presenceCheckId_fkey" FOREIGN KEY ("presenceCheckId") REFERENCES "PresenceCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_presenceCheckId_fkey" FOREIGN KEY ("presenceCheckId") REFERENCES "PresenceCheck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "ManualAudit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActionToken" ADD CONSTRAINT "UserActionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActionToken" ADD CONSTRAINT "UserActionToken_presenceCheckId_fkey" FOREIGN KEY ("presenceCheckId") REFERENCES "PresenceCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

