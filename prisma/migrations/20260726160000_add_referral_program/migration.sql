-- AlterTable: referral program fields on Organization.
-- referralCode is added nullable first, backfilled for any existing rows,
-- then locked to NOT NULL + UNIQUE — safe regardless of how many
-- Organization rows already exist (unlike a straight ADD COLUMN ... NOT NULL,
-- which would fail on a non-empty table with no default).
ALTER TABLE "Organization" ADD COLUMN     "referralCode" TEXT;
ALTER TABLE "Organization" ADD COLUMN     "referredByOrgId" TEXT;
ALTER TABLE "Organization" ADD COLUMN     "referralRewardAppliedAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN     "pendingFreeMonthCredits" INTEGER NOT NULL DEFAULT 0;

-- Backfill: give any pre-existing orgs a unique code before the NOT NULL/UNIQUE
-- constraints below are applied.
UPDATE "Organization"
SET "referralCode" = upper(substr(md5(random()::text || clock_timestamp()::text || id), 1, 8))
WHERE "referralCode" IS NULL;

ALTER TABLE "Organization" ALTER COLUMN "referralCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_referralCode_key" ON "Organization"("referralCode");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_referredByOrgId_fkey" FOREIGN KEY ("referredByOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
