DO $$
BEGIN
  CREATE TYPE "WebsiteStatus" AS ENUM ('NONE', 'IN_PROGRESS', 'BASIC', 'MOSTLY_COMPLETE', 'POLISHED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "GoogleBusinessProfileStatus" AS ENUM ('NONE', 'NOT_SURE', 'CLAIMED_INCOMPLETE', 'CLAIMED_MOSTLY_COMPLETE', 'ACTIVE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ReviewStrength" AS ENUM ('NONE', 'FEW', 'SOME', 'STRONG');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ReviewRequestCadence" AS ENUM ('NEVER', 'RARELY', 'SOMETIMES', 'REGULARLY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SocialPresenceLevel" AS ENUM ('NONE', 'ONE_OCCASIONAL', 'ONE_ACTIVE', 'MULTIPLE_ACTIVE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ComprehensiveReportRequestStatus" AS ENUM ('REQUESTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "NotificationEventType" ADD VALUE IF NOT EXISTS 'COMPREHENSIVE_REPORT_REQUESTED';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'ScoreTier' AND e.enumlabel = 'STRONG_FOOTING'
  ) THEN
    EXECUTE 'ALTER TYPE "ScoreTier" RENAME TO "ScoreTier_old"';
    EXECUTE 'CREATE TYPE "ScoreTier" AS ENUM (''LIMITED_FOUNDATION'', ''EARLY_STAGE_PRESENCE'', ''BASIC_FOUNDATION_CLEAR_GAPS'', ''SOLID_FOUNDATION_IMPROVEMENTS'', ''STRONG_ONLINE_PRESENCE'')';
    EXECUTE 'ALTER TABLE "Business" ALTER COLUMN "quickTier" TYPE "ScoreTier" USING (CASE WHEN "quickTier"::text = ''STRONG_FOOTING'' THEN ''STRONG_ONLINE_PRESENCE'' WHEN "quickTier"::text = ''PROMISING_UPSIDE'' THEN ''SOLID_FOUNDATION_IMPROVEMENTS'' WHEN "quickTier"::text = ''FOCUSED_ATTENTION'' THEN ''BASIC_FOUNDATION_CLEAR_GAPS'' ELSE NULL END::"ScoreTier")';
    EXECUTE 'ALTER TABLE "PresenceCheck" ALTER COLUMN "scoreTier" TYPE "ScoreTier" USING (CASE WHEN "scoreTier"::text = ''STRONG_FOOTING'' THEN ''STRONG_ONLINE_PRESENCE'' WHEN "scoreTier"::text = ''PROMISING_UPSIDE'' THEN ''SOLID_FOUNDATION_IMPROVEMENTS'' WHEN "scoreTier"::text = ''FOCUSED_ATTENTION'' THEN ''BASIC_FOUNDATION_CLEAR_GAPS'' ELSE NULL END::"ScoreTier")';
    EXECUTE 'DROP TYPE "ScoreTier_old"';
  END IF;
END $$;

ALTER TABLE "Business"
  ADD COLUMN IF NOT EXISTS "averageRating" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "googleBusinessProfileStatus" "GoogleBusinessProfileStatus",
  ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "reviewRequestCadence" "ReviewRequestCadence",
  ADD COLUMN IF NOT EXISTS "reviewStrength" "ReviewStrength",
  ADD COLUMN IF NOT EXISTS "runsAdvertising" "AdvertisingCadence",
  ADD COLUMN IF NOT EXISTS "socialLinks" JSONB,
  ADD COLUMN IF NOT EXISTS "socialPresenceLevel" "SocialPresenceLevel",
  ADD COLUMN IF NOT EXISTS "websiteStatus" "WebsiteStatus";

ALTER TABLE "PresenceCheck"
  ADD COLUMN IF NOT EXISTS "averageRating" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "googleBusinessProfileStatus" "GoogleBusinessProfileStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "reportEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "reportSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "reviewRequestCadence" "ReviewRequestCadence" NOT NULL DEFAULT 'NEVER',
  ADD COLUMN IF NOT EXISTS "reviewStrength" "ReviewStrength" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "socialPresenceLevel" "SocialPresenceLevel" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "websiteStatus" "WebsiteStatus" NOT NULL DEFAULT 'NONE';

DO $presence_check_backfill$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PresenceCheck'
      AND column_name = 'hasWebsite'
  ) THEN
    EXECUTE $sql$
      UPDATE "PresenceCheck"
      SET
        "websiteStatus" = CASE
          WHEN "hasWebsite" IS TRUE THEN 'BASIC'::"WebsiteStatus"
          WHEN "hasWebsite" IS FALSE THEN 'NONE'::"WebsiteStatus"
          ELSE 'IN_PROGRESS'::"WebsiteStatus"
        END,
        "googleBusinessProfileStatus" = CASE
          WHEN "usesGoogleBusinessProfile" IS TRUE THEN 'CLAIMED_INCOMPLETE'::"GoogleBusinessProfileStatus"
          WHEN "usesGoogleBusinessProfile" IS FALSE THEN 'NONE'::"GoogleBusinessProfileStatus"
          ELSE 'NOT_SURE'::"GoogleBusinessProfileStatus"
        END,
        "reviewStrength" = CASE
          WHEN "collectsReviews"::text = 'YES' THEN 'SOME'::"ReviewStrength"
          WHEN "collectsReviews"::text = 'SOMEWHAT' THEN 'FEW'::"ReviewStrength"
          ELSE 'NONE'::"ReviewStrength"
        END,
        "reviewRequestCadence" = CASE
          WHEN "collectsReviews"::text = 'YES' THEN 'SOMETIMES'::"ReviewRequestCadence"
          WHEN "collectsReviews"::text = 'SOMEWHAT' THEN 'RARELY'::"ReviewRequestCadence"
          ELSE 'NEVER'::"ReviewRequestCadence"
        END,
        "socialPresenceLevel" = CASE
          WHEN jsonb_typeof("socialPlatforms"::jsonb) = 'array' AND jsonb_array_length("socialPlatforms"::jsonb) > 1
            THEN 'MULTIPLE_ACTIVE'::"SocialPresenceLevel"
          WHEN jsonb_typeof("socialPlatforms"::jsonb) = 'array' AND jsonb_array_length("socialPlatforms"::jsonb) = 1
            THEN CASE
              WHEN "runsAdvertising" = 'YES' THEN 'ONE_ACTIVE'::"SocialPresenceLevel"
              ELSE 'ONE_OCCASIONAL'::"SocialPresenceLevel"
            END
          ELSE 'NONE'::"SocialPresenceLevel"
        END,
        "reportEmail" = COALESCE("reportEmail", "contactEmail")
      WHERE
        "websiteStatus" = 'NONE'::"WebsiteStatus"
        AND "googleBusinessProfileStatus" = 'NONE'::"GoogleBusinessProfileStatus"
        AND "reviewStrength" = 'NONE'::"ReviewStrength"
        AND "reviewRequestCadence" = 'NEVER'::"ReviewRequestCadence"
        AND "socialPresenceLevel" = 'NONE'::"SocialPresenceLevel";
    $sql$;
  END IF;
END $presence_check_backfill$;

UPDATE "PresenceCheck"
SET "reportEmail" = COALESCE("reportEmail", "contactEmail")
WHERE "reportEmail" IS NULL;

DO $business_backfill$
BEGIN
  EXECUTE $sql$
    WITH latest_presence_check AS (
      SELECT DISTINCT ON ("businessId")
        "businessId",
        "websiteStatus",
        "googleBusinessProfileStatus",
        "reviewStrength",
        "reviewRequestCadence",
        "socialPresenceLevel",
        "runsAdvertising",
        "reviewCount",
        "averageRating",
        "rawNotes"
      FROM "PresenceCheck"
      ORDER BY "businessId", "submittedAt" DESC, "updatedAt" DESC
    )
    UPDATE "Business" AS b
    SET
      "websiteStatus" = COALESCE(
        lpc."websiteStatus",
        CASE WHEN b."websiteUrl" IS NOT NULL THEN 'BASIC'::"WebsiteStatus" ELSE 'NONE'::"WebsiteStatus" END
      ),
      "googleBusinessProfileStatus" = COALESCE(
        lpc."googleBusinessProfileStatus",
        CASE WHEN b."googleBusinessProfileUrl" IS NOT NULL THEN 'CLAIMED_INCOMPLETE'::"GoogleBusinessProfileStatus" ELSE 'NONE'::"GoogleBusinessProfileStatus" END
      ),
      "reviewStrength" = COALESCE(lpc."reviewStrength", 'NONE'::"ReviewStrength"),
      "reviewRequestCadence" = COALESCE(lpc."reviewRequestCadence", 'NEVER'::"ReviewRequestCadence"),
      "socialPresenceLevel" = COALESCE(
        lpc."socialPresenceLevel",
        CASE
          WHEN jsonb_typeof(b."socialProfiles"::jsonb) = 'array' AND jsonb_array_length(b."socialProfiles"::jsonb) > 1
            THEN 'MULTIPLE_ACTIVE'::"SocialPresenceLevel"
          WHEN jsonb_typeof(b."socialProfiles"::jsonb) = 'array' AND jsonb_array_length(b."socialProfiles"::jsonb) = 1
            THEN 'ONE_OCCASIONAL'::"SocialPresenceLevel"
          ELSE 'NONE'::"SocialPresenceLevel"
        END
      ),
      "runsAdvertising" = COALESCE(lpc."runsAdvertising", b."runsAdvertising"),
      "reviewCount" = COALESCE(lpc."reviewCount", b."reviewCount"),
      "averageRating" = COALESCE(lpc."averageRating", b."averageRating"),
      "description" = COALESCE(b."description", lpc."rawNotes", b."notes")
    FROM latest_presence_check AS lpc
    WHERE b."id" = lpc."businessId";
  $sql$;

  EXECUTE $sql$
    UPDATE "Business"
    SET
      "websiteStatus" = COALESCE(
        "websiteStatus",
        CASE WHEN "websiteUrl" IS NOT NULL THEN 'BASIC'::"WebsiteStatus" ELSE 'NONE'::"WebsiteStatus" END
      ),
      "googleBusinessProfileStatus" = COALESCE(
        "googleBusinessProfileStatus",
        CASE WHEN "googleBusinessProfileUrl" IS NOT NULL THEN 'CLAIMED_INCOMPLETE'::"GoogleBusinessProfileStatus" ELSE 'NONE'::"GoogleBusinessProfileStatus" END
      ),
      "reviewStrength" = COALESCE("reviewStrength", 'NONE'::"ReviewStrength"),
      "reviewRequestCadence" = COALESCE("reviewRequestCadence", 'NEVER'::"ReviewRequestCadence"),
      "socialPresenceLevel" = COALESCE(
        "socialPresenceLevel",
        CASE
          WHEN jsonb_typeof("socialProfiles"::jsonb) = 'array' AND jsonb_array_length("socialProfiles"::jsonb) > 1
            THEN 'MULTIPLE_ACTIVE'::"SocialPresenceLevel"
          WHEN jsonb_typeof("socialProfiles"::jsonb) = 'array' AND jsonb_array_length("socialProfiles"::jsonb) = 1
            THEN 'ONE_OCCASIONAL'::"SocialPresenceLevel"
          ELSE 'NONE'::"SocialPresenceLevel"
        END
      ),
      "description" = COALESCE("description", "notes")
    WHERE
      "websiteStatus" IS NULL
      OR "googleBusinessProfileStatus" IS NULL
      OR "reviewStrength" IS NULL
      OR "reviewRequestCadence" IS NULL
      OR "socialPresenceLevel" IS NULL
      OR "description" IS NULL;
  $sql$;
END $business_backfill$;

ALTER TABLE "PresenceCheck"
  DROP COLUMN IF EXISTS "collectsReviews",
  DROP COLUMN IF EXISTS "hasWebsite",
  DROP COLUMN IF EXISTS "usesGoogleBusinessProfile";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'ReviewCollectionLevel'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND udt_name = 'ReviewCollectionLevel'
  ) THEN
    EXECUTE 'DROP TYPE "ReviewCollectionLevel"';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ComprehensiveReportRequest" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "presenceCheckId" TEXT,
    "requestedById" TEXT,
    "status" "ComprehensiveReportRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "ComprehensiveReportRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ComprehensiveReportRequest"
  ADD COLUMN IF NOT EXISTS "businessId" TEXT,
  ADD COLUMN IF NOT EXISTS "presenceCheckId" TEXT,
  ADD COLUMN IF NOT EXISTS "requestedById" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "ComprehensiveReportRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  ADD COLUMN IF NOT EXISTS "note" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3);

UPDATE "ComprehensiveReportRequest"
SET "updatedAt" = COALESCE("updatedAt", "createdAt", CURRENT_TIMESTAMP)
WHERE "updatedAt" IS NULL;

ALTER TABLE "ComprehensiveReportRequest"
  ALTER COLUMN "updatedAt" SET NOT NULL,
  ALTER COLUMN "updatedAt" DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "ComprehensiveReportRequest"
    WHERE "businessId" IS NULL
  ) THEN
    ALTER TABLE "ComprehensiveReportRequest"
      ALTER COLUMN "businessId" SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ComprehensiveReportRequest_businessId_createdAt_idx" ON "ComprehensiveReportRequest"("businessId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ComprehensiveReportRequest_status_createdAt_idx" ON "ComprehensiveReportRequest"("status", "createdAt" DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ComprehensiveReportRequest_businessId_fkey'
  ) THEN
    ALTER TABLE "ComprehensiveReportRequest"
      ADD CONSTRAINT "ComprehensiveReportRequest_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ComprehensiveReportRequest_presenceCheckId_fkey'
  ) THEN
    ALTER TABLE "ComprehensiveReportRequest"
      ADD CONSTRAINT "ComprehensiveReportRequest_presenceCheckId_fkey"
      FOREIGN KEY ("presenceCheckId") REFERENCES "PresenceCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ComprehensiveReportRequest_requestedById_fkey'
  ) THEN
    ALTER TABLE "ComprehensiveReportRequest"
      ADD CONSTRAINT "ComprehensiveReportRequest_requestedById_fkey"
      FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
