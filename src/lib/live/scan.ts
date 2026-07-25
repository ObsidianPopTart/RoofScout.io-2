import type { LeadDraft, ScanBounds, ScanRecord, Lead } from "../types";
import { createScanWithLeads } from "../store";
import { isNeglected } from "../leadFilter";
import { liveConfig } from "./config";
import { findBuildings, reverseGeocode, solarInsights, type BuildingCandidate } from "./providers";
import { fetchRoofImage } from "./providers";
import { gradeRoof, ungradedCondition } from "./vision";

function buildSalesAngles(draft: LeadDraft): string[] {
  const angles: string[] = [
    `Roof measured by satellite: ≈${draft.roof.areaSqFt.toLocaleString("en-US")} sq ft footprint, ` +
      `${draft.roof.pitch} pitch, ${draft.roof.segments} segments — the quote is defensible at the door.`,
  ];
  if (!draft.condition.graded) {
    angles.push(
      "Condition not yet AI-graded — review the attached satellite photo before the visit to confirm this is worth a knock."
    );
  } else if (draft.condition.score < 40) {
    angles.push("Severe visible damage from the air — lead with safety and the insurance-claim conversation.");
  } else if (draft.condition.score < 55) {
    angles.push("Multiple failure indicators visible — position replacement within one to two seasons.");
  }
  if (draft.condition.graded && draft.condition.issues.length > 0) {
    angles.push(`Bring the aerial printout: "${draft.condition.issues[0]}" is visible from above and hard to argue with.`);
  }
  angles.push(
    `Owner records not connected yet — pull the county assessor page for ${draft.address} before the visit.`
  );
  return angles;
}

async function analyzeBuilding(b: BuildingCandidate): Promise<LeadDraft | null> {
  const solar = await solarInsights(b.lat, b.lng);
  if (!solar) return null; // no Solar API coverage for this rooftop

  const [image, geo] = await Promise.all([
    fetchRoofImage(b.lat, b.lng),
    b.address ? Promise.resolve(null) : reverseGeocode(b.lat, b.lng),
  ]);

  const condition = (image && (await gradeRoof(image))) || ungradedCondition();
  if (!isNeglected(condition)) return null; // AI-graded and looks new/healthy — not a lead

  const draft: LeadDraft = {
    address: b.address ?? geo?.address ?? `Rooftop at ${b.lat.toFixed(5)}, ${b.lng.toFixed(5)}`,
    city: geo?.city ?? "",
    state: geo?.state ?? "",
    zip: geo?.zip ?? "",
    lat: b.lat,
    lng: b.lng,
    roof: {
      areaSqFt: solar.footprintSqFt,
      pitch: solar.pitch,
      material: "Unknown (verify on site)",
      estAgeYears: 0,
      segments: solar.segments,
    },
    condition,
    status: "New",
    salesAngles: [],
    imageUrl: `/api/roof-image?lat=${b.lat}&lng=${b.lng}`,
    source: "live",
  };
  draft.salesAngles = buildSalesAngles(draft);
  return draft;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function runLiveScan(
  orgId: string,
  bounds: ScanBounds
): Promise<{ scan: ScanRecord; leads: Lead[] }> {
  // Oversample: grading filters out healthy roofs, so scan more buildings than
  // we expect to keep as leads.
  const buildings = await findBuildings(bounds, liveConfig.maxBuildingsPerScan * 2);

  const drafts: LeadDraft[] = [];
  for (const group of chunk(buildings, 6)) {
    if (drafts.length >= liveConfig.maxBuildingsPerScan) break;
    const results = await Promise.allSettled(group.map((b) => analyzeBuilding(b)));
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) drafts.push(r.value);
      if (r.status === "rejected") console.error("Building analysis failed:", r.reason);
    }
  }

  return createScanWithLeads(orgId, bounds, "Live scan", drafts);
}
