import { prisma } from "./db";
import { normalizePlanTier } from "./usage";

const ZIP_RE = /^\d{5}$/;

export class TerritoryError extends Error {
  constructor(
    message: string,
    public readonly code: "not_apex" | "invalid_zip" | "already_claimed" | "not_owner"
  ) {
    super(message);
    this.name = "TerritoryError";
  }
}

export interface TerritoryClaimView {
  id: string;
  zipCode: string;
  claimedAt: Date;
}

export async function listTerritoryClaims(orgId: string): Promise<TerritoryClaimView[]> {
  return prisma.territoryClaim.findMany({
    where: { orgId },
    orderBy: { claimedAt: "asc" },
    select: { id: true, zipCode: true, claimedAt: true },
  });
}

// Apex-only perk: claiming a ZIP reserves it exclusively — the unique
// constraint on zipCode is what makes a second org's claim fail.
export async function claimTerritory(orgId: string, zipCodeInput: string): Promise<TerritoryClaimView> {
  const zipCode = zipCodeInput.trim();
  if (!ZIP_RE.test(zipCode)) {
    throw new TerritoryError("Enter a valid 5-digit ZIP code", "invalid_zip");
  }

  const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } });
  if (normalizePlanTier(org.planTier) !== "apex") {
    throw new TerritoryError("Territory exclusivity is an Apex-plan feature", "not_apex");
  }

  const existing = await prisma.territoryClaim.findUnique({ where: { zipCode } });
  if (existing) {
    if (existing.orgId === orgId) return existing;
    throw new TerritoryError("That ZIP code is already claimed by another company", "already_claimed");
  }

  return prisma.territoryClaim.create({ data: { orgId, zipCode } });
}

export async function releaseTerritory(orgId: string, claimId: string): Promise<void> {
  const claim = await prisma.territoryClaim.findUnique({ where: { id: claimId } });
  if (!claim || claim.orgId !== orgId) {
    throw new TerritoryError("Claim not found", "not_owner");
  }
  await prisma.territoryClaim.delete({ where: { id: claimId } });
}

// Called from the Stripe webhook when an org falls off Apex (downgrade or
// cancellation) — an org that isn't paying for exclusivity shouldn't keep
// squatting on a ZIP indefinitely.
export async function releaseAllTerritoriesForOrg(orgId: string): Promise<void> {
  await prisma.territoryClaim.deleteMany({ where: { orgId } });
}
