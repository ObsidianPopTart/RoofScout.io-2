-- Apex-tier territory exclusivity: one org can claim a ZIP code, and the
-- unique constraint prevents any other org from claiming the same one.
CREATE TABLE "TerritoryClaim" (
    "id" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TerritoryClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TerritoryClaim_zipCode_key" ON "TerritoryClaim"("zipCode");

CREATE INDEX "TerritoryClaim_orgId_idx" ON "TerritoryClaim"("orgId");

ALTER TABLE "TerritoryClaim" ADD CONSTRAINT "TerritoryClaim_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
