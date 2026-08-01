-- One-time-purchased scan credits that stack on top of the plan's own limit.
ALTER TABLE "Organization" ADD COLUMN "scanCreditBalance" INTEGER NOT NULL DEFAULT 0;
