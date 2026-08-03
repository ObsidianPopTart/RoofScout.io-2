import type { LeadDraft, ScanBounds, ScanRecord, Lead, Condition } from "../types";
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
  if (!solar) return null; // no Solar API coverage for this rooftop, or footprint failed the plausible-size check

  const [image, geo] = await Promise.all([
    fetchRoofImage(b.lat, b.lng),
    b.address ? Promise.resolve(null) : reverseGeocode(b.lat, b.lng),
  ]);

  let condition: Condition;
  if (image) {
    const outcome = await gradeRoof(image);
    if (outcome.status === "no-roof") return null; // not actually a rooftop — bad footprint data, tree cover, etc.
    condition = outcome.status === "graded" ? outcome.condition : ungradedCondition();
  } else {
    condition = ungradedCondition();
  }
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

export async function runLiveScan(
  orgId: string,
  bounds: ScanBounds,
  labelPrefix = "Live scan"
): Promise<{ scan: ScanRecord; leads: Lead[] }> {
  // Oversample: grading filters out healthy roofs, so scan more buildings than
  // we expect to keep as leads.
  const buildings = await findBuildings(bounds, liveConfig.maxBuildingsPerScan * 2);

  // Every candidate is analyzed concurrently rather than in sequential
  // batches — with an oversample this small (<=30 buildings), running them
  // all at once is well within provider rate limits and keeps total wall
  // time close to a single building's latency instead of multiplying it by
  // the number of batches, which matters for staying under the platform's
  // function execution limit (see `maxDuration` on the /api/scan route).
  const results = await Promise.allSettled(buildings.map((b) => analyzeBuilding(b)));
  const drafts: LeadDraft[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) drafts.push(r.value);
    if (r.status === "rejected") console.error("Building analysis failed:", r.reason);
  }
  drafts.length = Math.min(drafts.length, liveConfig.maxBuildingsPerScan);

  return createScanWithLeads(orgId, bounds, labelPrefix, drafts);
}
