import { prisma } from "./db";

const MS_PER_30_DAYS = 30 * 24 * 60 * 60 * 1000;

export class ScanLimitExceededError extends Error {
  constructor(public readonly limit: number) {
    super(`Monthly scan limit of ${limit} reached`);
    this.name = "ScanLimitExceededError";
  }
}

// Every tenant's scan hits the operator's own Google/Anthropic API keys, not
// a per-tenant key — an unmetered free tier could run up a large bill fast.
// Call this before running a scan; throws ScanLimitExceededError if the org
// is over its monthly cap. Resets the counter once 30 days have passed since
// the last reset, so this needs no cron job.
export async function checkAndIncrementScanUsage(orgId: string): Promise<void> {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } });

  const monthElapsed = Date.now() - org.scanCountResetAt.getTime() > MS_PER_30_DAYS;
  const currentCount = monthElapsed ? 0 : org.scanCountThisMonth;

  if (currentCount >= org.monthlyScanLimit) {
    throw new ScanLimitExceededError(org.monthlyScanLimit);
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      scanCountThisMonth: currentCount + 1,
      ...(monthElapsed ? { scanCountResetAt: new Date() } : {}),
    },
  });
}
