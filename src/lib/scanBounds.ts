import type { ScanBounds } from "./types";
import type { PlanTier } from "./usage";

// Keeps a single scan to roughly neighborhood-scale rather than "a whole
// city" — both for cost control (each building in view gets a Solar API +
// vision-grading call) and so the AI-graded sample stays representative
// rather than spread thin over a huge area. Free is capped much smaller
// than paid tiers: still enough to prove the product works on a real
// block, without letting an unpaid signup rack up a real API bill — a
// 292-building free-tier scan is exactly the kind of thing this exists to
// prevent. Paid tiers are the ones actually paying for the API usage they
// generate, so they keep the full neighborhood-scale cap.
export const MAX_SCAN_AREA_KM2_BY_TIER: Record<PlanTier, number> = {
  free: 0.3,
  pro: 5,
  apex: 5,
};

// Used for copy shown before a plan tier is known (e.g. the marketing
// site) — the largest any tier can do.
export const MAX_SCAN_AREA_KM2 = Math.max(...Object.values(MAX_SCAN_AREA_KM2_BY_TIER));

export function maxScanAreaKm2(planTier: PlanTier): number {
  return MAX_SCAN_AREA_KM2_BY_TIER[planTier];
}

export function boundsAreaKm2(bounds: ScanBounds): number {
  const latKm = (bounds.north - bounds.south) * 111;
  const midLatRad = ((bounds.north + bounds.south) / 2) * (Math.PI / 180);
  const lngKm = (bounds.east - bounds.west) * 111 * Math.cos(midLatRad);
  return Math.abs(latKm * lngKm);
}

export function isScanAreaTooLarge(bounds: ScanBounds, planTier: PlanTier): boolean {
  return boundsAreaKm2(bounds) > maxScanAreaKm2(planTier);
}
