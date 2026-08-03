// Storm-triggered marketing post generator (strategy doc section 4.4 / outreach
// copy pack section 4). Polls NWS for active severe-weather warnings, runs a
// RoofScout pass over the affected area using the SAME grading pipeline as a
// real scan (imported straight from src/lib/live — no duplicated logic to
// drift out of sync), and writes a draft post + backing data to
// storm-alerts/drafts/ for a human to review before posting anywhere.
//
// This is a standalone script, not a customer-facing feature: it does NOT
// touch Prisma, does NOT count against any org's scan usage, and does NOT
// auto-post to any social platform (there's no such integration — on purpose,
// see the "human review" note in the copy pack).
//
// Usage:
//   node node_modules/jiti/lib/jiti-cli.mjs scripts/storm-alert.ts [flags]
//   (or: npm run storm-alert -- [flags])
//
// Flags:
//   --state=TX            Only process alerts for this two-letter state code
//   --events=a,b           Comma-separated NWS event types (default: see EVENT_TYPES)
//   --limit=3               Max number of alerts to process this run (default 3)
//   --max-buildings=15      Rooftops analyzed per alert (default: ROOFSCOUT_MAX_BUILDINGS or 15)
//   --min-leads=3           Skip generating a post if fewer neglected roofs than this were found
//   --no-grade              Skip AI vision grading (faster/cheaper dry run — leads stay "Ungraded")
//   --dry-run               Fetch and log alerts only; no building/Solar/vision calls at all

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { findBuildings, solarInsights, fetchRoofImage } from "../src/lib/live/providers";
import { gradeRoof, ungradedCondition } from "../src/lib/live/vision";
import { isNeglected } from "../src/lib/leadFilter";
import { isScanAreaTooLarge, MAX_SCAN_AREA_KM2 } from "../src/lib/scanBounds";
import type { ScanBounds, Condition } from "../src/lib/types";

// ---------------------------------------------------------------------------
// Minimal .env / .env.local loader (no new dependency). Doesn't override
// anything already set in the environment; silently skips missing files —
// this script should still run (against whatever's already in process.env)
// in CI or other setups that inject env vars a different way.
// ---------------------------------------------------------------------------
function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
loadEnvFile(path.join(projectRoot, ".env"));
loadEnvFile(path.join(projectRoot, ".env.local"));

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
function flag(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : undefined;
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const EVENT_TYPES = (flag("events") ?? "Severe Thunderstorm Warning,Tornado Warning").split(",").map((s) => s.trim());
const STATE_FILTER = flag("state")?.toUpperCase();
const ALERT_LIMIT = Number(flag("limit") ?? 3);
const MAX_BUILDINGS = Number(flag("max-buildings") ?? process.env.ROOFSCOUT_MAX_BUILDINGS ?? 15);
const MIN_LEADS_FOR_POST = Number(flag("min-leads") ?? 3);
const SKIP_GRADING = hasFlag("no-grade");
const DRY_RUN = hasFlag("dry-run");

// ---------------------------------------------------------------------------
// NWS active alerts
// ---------------------------------------------------------------------------
interface NwsFeature {
  properties: {
    id: string;
    areaDesc: string;
    event: string;
    severity: string;
    effective: string;
    description: string;
  };
  geometry: { type: string; coordinates: unknown } | null;
}

interface NwsResponse {
  features: NwsFeature[];
}

async function fetchActiveAlerts(): Promise<NwsFeature[]> {
  const params = new URLSearchParams();
  for (const event of EVENT_TYPES) params.append("event", event);
  if (STATE_FILTER) params.set("area", STATE_FILTER);

  const url = `https://api.weather.gov/alerts/active?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "RoofScout/1.0 (storm-alert marketing script; contact via roof-scout.org)",
      Accept: "application/geo+json",
    },
  });
  if (!res.ok) throw new Error(`NWS alerts request failed: HTTP ${res.status}`);
  const data = (await res.json()) as NwsResponse;
  return data.features;
}

// Best-effort text extraction — NWS warning text isn't strictly structured,
// so this is a "good enough for a marketing post" read, not a hazard feed.
// Always sanity-check against the source alert before publishing.
function extractHazard(description: string): string {
  const combined = description.match(/HAZARD\.\.\.([^\n]+)/i);
  if (combined) return combined[1].trim().replace(/\.$/, "");

  const hail = description.match(/\*?\s*HAIL\.\.\.([^\n]+)/i)?.[1]?.trim();
  const wind = description.match(/\*?\s*WIND\.\.\.([^\n]+)/i)?.[1]?.trim();
  const parts = [hail && `${hail} hail`, wind && `${wind} wind`].filter(Boolean);
  return parts.length > 0 ? parts.join(" and ") : "severe weather";
}

// Centroid of a GeoJSON Polygon/MultiPolygon's outer ring(s) — a rough
// approximation, fine for picking "where to point the scan," not a precise
// storm-damage boundary.
function centroidOfGeometry(geometry: NwsFeature["geometry"]): { lat: number; lng: number } | null {
  if (!geometry) return null;
  const rings: number[][][] =
    geometry.type === "Polygon"
      ? (geometry.coordinates as number[][][])
      : geometry.type === "MultiPolygon"
        ? (geometry.coordinates as number[][][][]).flat()
        : [];
  const points = rings.flat();
  if (points.length === 0) return null;

  let sumLat = 0;
  let sumLng = 0;
  for (const [lng, lat] of points) {
    sumLat += lat;
    sumLng += lng;
  }
  return { lat: sumLat / points.length, lng: sumLng / points.length };
}

// A box just under MAX_SCAN_AREA_KM2, centered on the alert. 0.009 degrees
// latitude is ~1km; comfortably under the cap while still catching a
// meaningful residential sample.
function boundsAroundPoint(lat: number, lng: number): ScanBounds {
  const halfLat = 0.0095;
  const halfLng = 0.0095 / Math.max(Math.cos((lat * Math.PI) / 180), 0.15);
  return { north: lat + halfLat, south: lat - halfLat, east: lng + halfLng, west: lng - halfLng };
}

// ---------------------------------------------------------------------------
// Scan pipeline — mirrors src/lib/live/scan.ts's runLiveScan, but reads
// directly from the providers/vision modules instead of going through
// createScanWithLeads (which is Prisma/org-scoped — wrong tool here).
// ---------------------------------------------------------------------------
interface ScannedRoof {
  address?: string;
  lat: number;
  lng: number;
  areaSqFt: number;
  condition: Condition;
  imageNote: string;
}

async function scanArea(bounds: ScanBounds): Promise<ScannedRoof[]> {
  const buildings = await findBuildings(bounds);
  const results: ScannedRoof[] = [];

  for (const b of buildings) {
    if (results.length >= MAX_BUILDINGS) break;
    const solar = await solarInsights(b.lat, b.lng);
    if (!solar) continue; // no Solar API coverage for this rooftop

    let condition: Condition;
    if (SKIP_GRADING) {
      condition = ungradedCondition();
    } else {
      const image = await fetchRoofImage(b.lat, b.lng);
      if (image) {
        const outcome = await gradeRoof(image);
        if (outcome.status === "no-roof") continue; // not actually a rooftop — skip it
        condition = outcome.status === "graded" ? outcome.condition : ungradedCondition();
      } else {
        condition = ungradedCondition();
      }
    }

    results.push({
      address: b.address,
      lat: b.lat,
      lng: b.lng,
      areaSqFt: solar.footprintSqFt,
      condition,
      imageNote: "Satellite imagery via Google Maps — attach/review before posting owner-identifying details.",
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Post template — verbatim from RoofScout_Outreach_Copy_Pack.docx, section 4.
// ---------------------------------------------------------------------------
function renderPost(opts: {
  areaDesc: string;
  hazard: string;
  effectiveDate: string;
  totalScanned: number;
  neglectedCount: number;
  avgSqFt: number;
}): string {
  const { areaDesc, hazard, effectiveDate, totalScanned, neglectedCount, avgSqFt } = opts;
  return (
    `${areaDesc} took ${hazard} on ${effectiveDate}. Ran a RoofScout pass over the area this morning — ` +
    `${neglectedCount} of ${totalScanned} roofs scanned came back fair-or-worse condition, avg. ${avgSqFt.toLocaleString(
      "en-US"
    )} sq ft. List with addresses here for any crew headed that way: [link — attach the CSV/PDF export before posting].`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Fetching active alerts (${EVENT_TYPES.join(", ")})${STATE_FILTER ? ` in ${STATE_FILTER}` : ""}...`);
  const allAlerts = await fetchActiveAlerts();
  const withGeometry = allAlerts.filter((a) => a.geometry !== null).slice(0, ALERT_LIMIT);
  console.log(`Found ${allAlerts.length} active alert(s), ${withGeometry.length} with usable geometry — processing up to ${ALERT_LIMIT}.`);

  if (withGeometry.length === 0) {
    console.log("Nothing to do right now — no matching alerts with geometry. Run again after the next storm.");
    return;
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn(
      "WARNING: GOOGLE_MAPS_API_KEY not set — building/roof measurement will return no coverage. " +
        "Add it to .env.local (see SETUP.md) to run this for real."
    );
  }
  if (!SKIP_GRADING && !process.env.ANTHROPIC_API_KEY) {
    console.warn("WARNING: ANTHROPIC_API_KEY not set — roofs will come back Ungraded, not fair-or-worse. Use --no-grade to silence this.");
  }

  const draftsDir = path.join(projectRoot, "storm-alerts", "drafts");
  fs.mkdirSync(draftsDir, { recursive: true });

  for (const alert of withGeometry) {
    const { areaDesc, event, description, effective, id } = alert.properties;
    const hazard = extractHazard(description);
    const effectiveDate = new Date(effective).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    console.log(`\n--- ${event}: ${areaDesc} (${effectiveDate}) — ${hazard} ---`);

    const centroid = centroidOfGeometry(alert.geometry);
    if (!centroid) {
      console.log("Could not compute a centroid for this alert's geometry — skipping.");
      continue;
    }
    const bounds = boundsAroundPoint(centroid.lat, centroid.lng);
    if (isScanAreaTooLarge(bounds)) {
      console.log(`Computed bounds exceed the ${MAX_SCAN_AREA_KM2} km² scan cap — skipping (this shouldn't normally happen).`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run] Would scan ~${MAX_SCAN_AREA_KM2} km² around ${centroid.lat.toFixed(4)}, ${centroid.lng.toFixed(4)}.`);
      continue;
    }

    const roofs = await scanArea(bounds);
    const neglected = roofs.filter((r) => isNeglected(r.condition));
    console.log(`Scanned ${roofs.length} rooftop(s), ${neglected.length} came back fair-or-worse.`);

    if (neglected.length < MIN_LEADS_FOR_POST) {
      console.log(`Below --min-leads (${MIN_LEADS_FOR_POST}) — not generating a post for this one.`);
      continue;
    }

    const avgSqFt = Math.round(neglected.reduce((sum, r) => sum + r.areaSqFt, 0) / neglected.length);
    const post = renderPost({
      areaDesc,
      hazard,
      effectiveDate,
      totalScanned: roofs.length,
      neglectedCount: neglected.length,
      avgSqFt,
    });

    const slug = areaDesc.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const base = `${stamp}_${slug || id.slice(-8)}`;

    const markdown = [
      `# Storm alert draft — ${areaDesc}`,
      "",
      "**REVIEW BEFORE POSTING.** This was generated automatically — read it, check the numbers, and post it",
      "yourself into the relevant community. Do not wire this up to auto-post; see the outreach copy pack, section 4.",
      "",
      `- NWS alert: ${event}, effective ${effectiveDate}`,
      `- Hazard (parsed from warning text — verify against the source): ${hazard}`,
      `- Scan center: ${centroid.lat.toFixed(5)}, ${centroid.lng.toFixed(5)}`,
      `- Rooftops scanned: ${roofs.length} · fair-or-worse: ${neglected.length} · avg sq ft: ${avgSqFt.toLocaleString("en-US")}`,
      "",
      "## Post copy",
      "",
      "> " + post,
      "",
      "## Neglected roofs found",
      "",
      "| Address | Sq Ft | Condition | Score | Notes |",
      "|---|---|---|---|---|",
      ...neglected.map(
        (r) =>
          `| ${r.address ?? `${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`} | ${r.areaSqFt.toLocaleString("en-US")} | ${r.condition.label} | ${r.condition.graded ? r.condition.score : "—"} | ${r.condition.summary || "—"} |`
      ),
      "",
      "_Owner contact info isn't attached — the live scan pipeline doesn't have a parcel-data provider connected yet",
      "(see src/lib/types.ts and SETUP.md). Pull it from the county assessor site before handing this to a sales team._",
    ].join("\n");

    fs.writeFileSync(path.join(draftsDir, `${base}.md`), markdown);
    fs.writeFileSync(
      path.join(draftsDir, `${base}.json`),
      JSON.stringify({ alertId: id, areaDesc, event, hazard, effectiveDate, bounds, roofs, neglectedCount: neglected.length }, null, 2)
    );
    console.log(`Draft written: storm-alerts/drafts/${base}.md`);
  }
}

main().catch((err) => {
  console.error("storm-alert script failed:", err);
  process.exitCode = 1;
});
