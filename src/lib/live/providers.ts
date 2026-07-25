import type { ScanBounds } from "../types";
import { PITCH_FACTORS } from "../quote";
import { liveConfig } from "./config";

export interface BuildingCandidate {
  lat: number;
  lng: number;
  address?: string;
}

// A denylist, not an allowlist. Most US suburban buildings — including
// ordinary single-family houses — come from bulk footprint imports tagged
// generically `building=yes`, not a specific residential subtype (verified
// empirically: 164/200 buildings in a Nashville test scan were "yes"). An
// allowlist of residential subtypes silently excludes real houses. Explicitly
// non-residential tags are excluded here; the roof-area sanity cap in
// solarInsights() catches any oversized building that slips through untagged.
const NON_RESIDENTIAL_TAGS = new Set([
  "university",
  "college",
  "school",
  "dormitory",
  "church",
  "chapel",
  "mosque",
  "synagogue",
  "temple",
  "commercial",
  "retail",
  "industrial",
  "warehouse",
  "office",
  "hospital",
  "hotel",
  "civic",
  "government",
  "public",
  "stadium",
  "sports_hall",
  "grandstand",
  "hangar",
  "parking",
  "garage",
  "garages",
  "carport",
  "shed",
  "roof",
  "greenhouse",
  "farm_auxiliary",
  "barn",
  "construction",
  "service",
  "transportation",
  "train_station",
  "supermarket",
  "kiosk",
  "static_caravan",
]);

interface OverpassElement {
  type: string;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

// Every outbound call gets a hard timeout. Without one, a single stalled TCP
// connection (observed in practice: 90s+ hangs, likely a bad IPv6 route) can
// block an entire scan for minutes with no error and no feedback.
const FETCH_TIMEOUT_MS = 12_000;

function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

// Overpass mirrors, tried in order. The primary (overpass-api.de) has been
// bouncing requests that look like generic bot traffic (missing/generic
// User-Agent) since it started fighting AI-scraper load in 2025-2026 — a
// descriptive User-Agent plus an explicit Accept header satisfies it. The
// kumi.systems mirror is the fallback if the primary is still unhappy.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const OVERPASS_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": "RoofScout/1.0 (roofing lead-generation tool; building-footprint lookup)",
  Accept: "application/json",
};

async function queryOverpass(query: string): Promise<{ elements?: OverpassElement[] }> {
  let lastError: Error | null = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: OVERPASS_HEADERS,
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) {
        lastError = new Error(`Building lookup failed (Overpass HTTP ${res.status} from ${endpoint})`);
        continue;
      }
      return (await res.json()) as { elements?: OverpassElement[] };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error("Building lookup failed (no Overpass endpoint reachable)");
}

// Building footprints come from OpenStreetMap (free, ODbL-licensed) —
// we only need centroids to feed the Google Solar API.
export async function findBuildings(bounds: ScanBounds, limit: number): Promise<BuildingCandidate[]> {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  const query = `[out:json][timeout:25];way["building"](${bbox});out center tags ${Math.max(limit * 4, 80)};`;

  const data = await queryOverpass(query);
  const withCenter = (data.elements ?? []).filter((e) => e.center);

  const toCandidate = (e: OverpassElement): BuildingCandidate => {
    const tags = e.tags ?? {};
    const address =
      tags["addr:housenumber"] && tags["addr:street"]
        ? `${tags["addr:housenumber"]} ${tags["addr:street"]}`
        : undefined;
    return { lat: e.center!.lat, lng: e.center!.lon, address };
  };

  const residential = withCenter.filter((e) => !NON_RESIDENTIAL_TAGS.has(e.tags?.building ?? ""));

  return residential.slice(0, limit).map(toCandidate);
}

export interface SolarRoofData {
  footprintSqFt: number;
  segments: number;
  pitch: string;
}

// A single-family home roof footprint essentially never exceeds this. Google
// Solar's "findClosest" can still snap to a nearby non-residential building
// if OSM's centroid was slightly off; this is the last line of defense.
const MAX_PLAUSIBLE_HOME_ROOF_SQFT = 8000;

interface SolarResponse {
  solarPotential?: {
    wholeRoofStats?: { areaMeters2?: number; groundAreaMeters2?: number };
    roofSegmentStats?: Array<{ pitchDegrees?: number; stats?: { areaMeters2?: number } }>;
  };
}

const SQM_TO_SQFT = 10.7639;

function nearestPitch(degrees: number): string {
  const rise = Math.tan((degrees * Math.PI) / 180) * 12;
  let best = "6/12";
  let bestDiff = Infinity;
  for (const key of Object.keys(PITCH_FACTORS)) {
    const keyRise = Number(key.split("/")[0]);
    const diff = Math.abs(keyRise - rise);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = key;
    }
  }
  return best;
}

// Google Solar API: measured roof geometry per building. Returns null when
// Google has no coverage for that rooftop (common outside metro areas) or
// the request times out.
export async function solarInsights(lat: number, lng: number): Promise<SolarRoofData | null> {
  const url =
    `https://solar.googleapis.com/v1/buildingInsights:findClosest` +
    `?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=LOW&key=${liveConfig.googleKey}`;
  let res: Response;
  try {
    res = await fetchWithTimeout(url);
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = (await res.json()) as SolarResponse;
  const sp = data.solarPotential;
  if (!sp?.wholeRoofStats) return null;

  const groundM2 = sp.wholeRoofStats.groundAreaMeters2 ?? (sp.wholeRoofStats.areaMeters2 ?? 0) / 1.15;
  if (!groundM2) return null;
  const footprintSqFt = Math.round(groundM2 * SQM_TO_SQFT);
  if (footprintSqFt > MAX_PLAUSIBLE_HOME_ROOF_SQFT) return null; // not a house — skip it

  const segments = sp.roofSegmentStats?.length ?? 2;
  const avgPitchDeg =
    sp.roofSegmentStats && sp.roofSegmentStats.length > 0
      ? sp.roofSegmentStats.reduce((sum, s) => sum + (s.pitchDegrees ?? 25), 0) / sp.roofSegmentStats.length
      : 25;

  return {
    footprintSqFt,
    segments,
    pitch: nearestPitch(avgPitchDeg),
  };
}

export interface GeocodedAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface GeocodeResponse {
  results?: Array<{
    address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
  }>;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress | null> {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?latlng=${lat},${lng}&result_type=street_address&key=${liveConfig.googleKey}`;
  let res: Response;
  try {
    res = await fetchWithTimeout(url);
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = (await res.json()) as GeocodeResponse;
  const components = data.results?.[0]?.address_components;
  if (!components) return null;

  const find = (type: string, short = false) => {
    const c = components.find((x) => x.types.includes(type));
    return c ? (short ? c.short_name : c.long_name) : "";
  };

  const streetNumber = find("street_number");
  const route = find("route");
  if (!streetNumber || !route) return null;

  return {
    address: `${streetNumber} ${route}`,
    city: find("locality") || find("sublocality"),
    state: find("administrative_area_level_1", true),
    zip: find("postal_code"),
  };
}

// Satellite tile for one rooftop, fetched server-side so the API key never
// reaches the browser. Used both for Claude vision grading and (via the
// /api/roof-image proxy) for display on the profile page.
export async function fetchRoofImage(lat: number, lng: number): Promise<Buffer | null> {
  const url =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}&zoom=20&size=640x640&maptype=satellite&key=${liveConfig.googleKey}`;
  let res: Response;
  try {
    res = await fetchWithTimeout(url);
  } catch {
    return null;
  }
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}
