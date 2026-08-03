// Recent hail/wind ground-truth reports for the Apex-tier Storm Tracker map
// layer, from NOAA's Storm Prediction Center — free, public, no API key.
// Complements src/lib/weather/nws.ts's *active* warning polygons: an active
// warning disappears once a storm passes, but the addresses it actually hit
// are exactly what a storm-response crew wants to target for days afterward,
// which is what these reports capture.

export interface StormReport {
  type: "hail" | "wind";
  date: string; // YYYY-MM-DD, from the report file's date (not embedded per-row)
  time: string; // HHMM, local to the reporting office — display only
  magnitudeValue: number | null; // inches (hail) or mph (wind); null when SPC has no measurement ("UNK")
  magnitudeLabel: string; // e.g. "1.25 in hail", "60 mph wind", "Wind damage reported"
  location: string;
  county: string;
  state: string;
  lat: number;
  lng: number;
  comments: string;
}

// Minimal RFC4180-ish CSV line parser — handles quoted fields (SPC quotes
// any Comments field containing a comma), which a plain .split(",") would
// silently corrupt.
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

function yymmdd(date: Date): string {
  const yy = String(date.getUTCFullYear()).slice(2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

async function fetchReportsForDay(fileDateStr: string, isoDate: string, kind: "hail" | "wind"): Promise<StormReport[]> {
  const url = `https://www.spc.noaa.gov/climo/reports/${fileDateStr}_rpts_${kind}.csv`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return []; // a day with no reports yet published is normal, not an error

  const text = await res.text();
  const rows = text
    .trim()
    .split("\n")
    .map((line) => parseCsvLine(line));
  const [header, ...body] = rows;
  if (!header || header[0] !== "Time") return [];

  return body
    .filter((r) => r.length >= 7)
    .map((r): StormReport | null => {
      const [time, sizeOrSpeed, location, county, state, latStr, lngStr, comments = ""] = r;
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      let magnitudeValue: number | null = null;
      let magnitudeLabel: string;
      if (kind === "hail") {
        const inches = parseFloat(sizeOrSpeed) / 100; // SPC reports hail size in hundredths of an inch
        magnitudeValue = Number.isFinite(inches) ? inches : null;
        magnitudeLabel = magnitudeValue !== null ? `${magnitudeValue.toFixed(2)} in hail` : "Hail reported";
      } else {
        const mph = parseFloat(sizeOrSpeed);
        magnitudeValue = sizeOrSpeed !== "UNK" && Number.isFinite(mph) ? mph : null;
        magnitudeLabel = magnitudeValue !== null ? `${magnitudeValue} mph wind` : "Wind damage reported";
      }

      return {
        type: kind,
        date: isoDate,
        time: time.padStart(4, "0"),
        magnitudeValue,
        magnitudeLabel,
        location,
        county,
        state,
        lat,
        lng,
        comments,
      };
    })
    .filter((r): r is StormReport => r !== null);
}

// Fetches hail + wind reports for each of the last `days` calendar days
// (clamped 1-7 — SPC's own daily-summary convention, and enough for the
// "which streets got hit this week" use case without ballooning fetch count).
export async function fetchRecentStormReports(days: number): Promise<StormReport[]> {
  const clampedDays = Math.min(Math.max(Math.trunc(days) || 1, 1), 7);
  const today = new Date();

  const tasks: Promise<StormReport[]>[] = [];
  for (let i = 0; i < clampedDays; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const isoDate = d.toISOString().slice(0, 10);
    const fileDateStr = yymmdd(d);
    tasks.push(fetchReportsForDay(fileDateStr, isoDate, "hail"));
    tasks.push(fetchReportsForDay(fileDateStr, isoDate, "wind"));
  }

  const results = await Promise.allSettled(tasks);
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
