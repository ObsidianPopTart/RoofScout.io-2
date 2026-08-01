import { prisma } from "./db";

const MS_PER_30_DAYS = 30 * 24 * 60 * 60 * 1000;

// Every tenant's scan hits the operator's own Google/Anthropic API keys, not
// a per-tenant key — an unmetered free tier could run up a large bill fast.
// Free is capped for the org's whole lifetime (not monthly); paid tiers get
// a monthly allowance that resets on a rolling 30-day basis, no cron needed.
export const PLAN_LIMITS = {
  free: { lifetimeScans: 3, scansPerMonth: null },
  pro: { lifetimeScans: null, scansPerMonth: 50 },
  apex: { lifetimeScans: null, scansPerMonth: null },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

export function normalizePlanTier(value: string): PlanTier {
  return value === "pro" || value === "apex" ? value : "free";
}

export class ScanLimitExceededError extends Error {
  constructor(
    public readonly planTier: PlanTier,
    public readonly limit: number
  ) {
    super(
      planTier === "free"
        ? `Free plan is limited to ${limit} scans total`
        : `Monthly scan limit of ${limit} reached`
    );
    this.name = "ScanLimitExceededError";
  }
}

// Consumes one purchased scan credit (see scripts/stripe-setup.mjs's scan
// pack price); returns whether one was actually available and spent.
// Conditional updateMany makes this safe against concurrent scans racing
// each other down to a negative balance.
async function tryConsumeScanCredit(orgId: string): Promise<boolean> {
  const claim = await prisma.organization.updateMany({
    where: { id: orgId, scanCreditBalance: { gt: 0 } },
    data: { scanCreditBalance: { decrement: 1 } },
  });
  return claim.count > 0;
}

// Call this before running a scan; throws ScanLimitExceededError if the org
// is over its plan's cap and has no purchased scan credits left either.
export async function checkAndIncrementScanUsage(orgId: string): Promise<void> {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } });
  const plan = normalizePlanTier(org.planTier);
  const limits = PLAN_LIMITS[plan];

  if (limits.lifetimeScans !== null) {
    const totalScans = await prisma.scanRecord.count({ where: { orgId } });
    if (totalScans >= limits.lifetimeScans) {
      if (await tryConsumeScanCredit(orgId)) return;
      throw new ScanLimitExceededError(plan, limits.lifetimeScans);
    }
    return; // creating the ScanRecord itself advances this count next time
  }

  if (limits.scansPerMonth === null) {
    return; // unlimited (apex)
  }

  const monthElapsed = Date.now() - org.scanCountResetAt.getTime() > MS_PER_30_DAYS;
  const currentCount = monthElapsed ? 0 : org.scanCountThisMonth;

  if (currentCount >= limits.scansPerMonth) {
    if (await tryConsumeScanCredit(orgId)) return;
    throw new ScanLimitExceededError(plan, limits.scansPerMonth);
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      scanCountThisMonth: currentCount + 1,
      ...(monthElapsed ? { scanCountResetAt: new Date() } : {}),
    },
  });
}
