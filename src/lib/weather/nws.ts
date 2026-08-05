// Customer-facing storm alerts for the Apex-tier "Storm Tracker" map layer.
// Independent of scripts/storm-alert.ts (an internal marketing script with a
// different output shape and its own review workflow) — kept separate on
// purpose so a change to one never silently changes the other's behavior.
const EVENT_TYPES = ["Severe Thunderstorm Warning", "Tornado Warning"];

export interface StormAlert {
  id: string;
  event: string;
  areaDesc: string;
  severity: string;
  hazard: string;
  effective: string;
  expires: string;
  centroid: { lat: number; lng: number } | null;
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: unknown } | null;
}

interface NwsFeature {
  properties: {
    id: string;
    areaDesc: string;
    event: string;
    severity: string;
    effective: string;
    expires: string;
    description: string;
  };
  geometry: { type: string; coordinates: unknown } | null;
}

interface NwsResponse {
  features: NwsFeature[];
}

// Best-effort text extraction — NWS warning text isn't strictly structured,
// so this is "good enough to show in a popup," not a hazard feed.
function extractHazard(description: string): string {
  const combined = description.match(/HAZARD\.\.\.([^\n]+)/i);
  if (combined) return combined[1].trim().replace(/\.$/, "");

  const hail = description.match(/\*?\s*HAIL\.\.\.([^\n]+)/i)?.[1]?.trim();
  const wind = description.match(/\*?\s*WIND\.\.\.([^\n]+)/i)?.[1]?.trim();
  const parts = [hail && `${hail} hail`, wind && `${wind} wind`].filter(Boolean);
  return parts.length > 0 ? parts.join(" and ") : "Severe weather";
}

// Centroid of a GeoJSON Polygon/MultiPolygon's outer ring(s) — a rough
// approximation for centering the map, not a precise storm-damage boundary.
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

export async function fetchActiveStormAlerts(): Promise<StormAlert[]> {
  const params = new URLSearchParams();
  for (const event of EVENT_TYPES) params.append("event", event);

  const res = await fetch(`https://api.weather.gov/alerts/active?${params.toString()}`, {
    headers: {
      "User-Agent": "RoofScout.io/1.0 (Storm Tracker feature; contact via roofscout.io)",
      Accept: "application/geo+json",
    },
    // Alerts update frequently; avoid Next.js caching a stale severe-weather feed.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`NWS alerts request failed: HTTP ${res.status}`);
  const data = (await res.json()) as NwsResponse;

  return data.features
    .filter((f) => f.geometry !== null)
    .map((f) => ({
      id: f.properties.id,
      event: f.properties.event,
      areaDesc: f.properties.areaDesc,
      severity: f.properties.severity,
      hazard: extractHazard(f.properties.description),
      effective: f.properties.effective,
      expires: f.properties.expires,
      centroid: centroidOfGeometry(f.geometry),
      geometry: f.geometry as StormAlert["geometry"],
    }));
}
