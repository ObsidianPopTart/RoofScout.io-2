import type { ScanBounds } from "./types";

// Keeps a single scan to roughly neighborhood-scale rather than "a whole
// city" — both for cost control (each building in view gets a Solar API +
// vision-grading call) and so the AI-graded sample stays representative
// rather than spread thin over a huge area.
export const MAX_SCAN_AREA_KM2 = 5;

export function boundsAreaKm2(bounds: ScanBounds): number {
  const latKm = (bounds.north - bounds.south) * 111;
  const midLatRad = ((bounds.north + bounds.south) / 2) * (Math.PI / 180);
  const lngKm = (bounds.east - bounds.west) * 111 * Math.cos(midLatRad);
  return Math.abs(latKm * lngKm);
}

export function isScanAreaTooLarge(bounds: ScanBounds): boolean {
  return boundsAreaKm2(bounds) > MAX_SCAN_AREA_KM2;
}
