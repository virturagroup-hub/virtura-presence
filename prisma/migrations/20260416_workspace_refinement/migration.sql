-- CreateEnum
CREATE TYPE "BusinessLifecycleStage" AS ENUM ('LEAD', 'FREE_AUDIT_REQUESTED', 'FREE_AUDIT_REVIEWED', 'COMPREHENSIVE_AUDIT_REQUESTED', 'COMPREHENSIVE_AUDIT_IN_PROGRESS', 'AUDIT_PUBLISHED', 'FOLLOW_UP_SENT', 'CONVERTED', 'ONGOING_CARE', 'CLOSED_INACTIVE');

-- CreateEnum
CREATE TYPE "AuditScope" AS ENUM ('FREE_REVIEW', 'COMPREHENSIVE');

-- CreateEnum
CREATE TYPE "AuditChecklistStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'NEEDS_ATTENTION');

-- CreateEnum
CREATE TYPE "AuditEvidenceStage" AS ENUM ('BEFORE', 'AFTER', 'PROGRESS', 'REFERENCE');

-- CreateEnum
CREATE TYPE "ImplementationRecommendation" AS ENUM ('DIY', 'DONE_FOR_YOU', 'HYBRID', 'CONSULTATION');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "lastClientContactAt" TIMESTAMP(3),
ADD COLUMN     "lifecycleStage" "BusinessLifecycleStage" NOT NULL DEFAULT 'FREE_AUDIT_REQUESTED';

-- AlterTable
ALTER TABLE "ManualAudit" ADD COLUMN     "actionPlan" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "implementationNotes" TEXT,
ADD COLUMN     "implementationRecommendation" "ImplementationRecommendation" NOT NULL DEFAULT 'CONSULTATION',
ADD COLUMN     "progressPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scope" "AuditScope" NOT NULL DEFAULT 'FREE_REVIEW',
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AuditChecklistItem" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "AuditChecklistStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "recommendation" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvidence" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "category" "AuditCategory",
    "label" TEXT NOT NULL,
    "assetUrl" TEXT,
    "notes" TEXT,
    "stage" "AuditEvidenceStage" NOT NULL DEFAULT 'REFERENCE',
    "clientVisible" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditChecklistItem_auditId_category_displayOrder_idx" ON "AuditChecklistItem"("auditId", "category", "displayOrder");

-- CreateIndex
CREATE INDEX "AuditEvidence_auditId_category_displayOrder_idx" ON "AuditEvidence"("auditId", "category", "displayOrder");

-- CreateIndex
CREATE INDEX "Business_lifecycleStage_latestSubmittedAt_idx" ON "Business"("lifecycleStage", "latestSubmittedAt" DESC);

-- CreateIndex
CREATE INDEX "Business_status_latestSubmittedAt_idx" ON "Business"("status", "latestSubmittedAt" DESC);

-- CreateIndex
CREATE INDEX "Business_assignedConsultantId_latestSubmittedAt_idx" ON "Business"("assignedConsultantId", "latestSubmittedAt" DESC);

-- CreateIndex
CREATE INDEX "ManualAudit_scope_status_updatedAt_idx" ON "ManualAudit"("scope", "status", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "ManualAudit_businessId_updatedAt_idx" ON "ManualAudit"("businessId", "updatedAt" DESC);

-- AddForeignKey
ALTER TABLE "AuditChecklistItem" ADD CONSTRAINT "AuditChecklistItem_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "ManualAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvidence" ADD CONSTRAINT "AuditEvidence_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "ManualAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
