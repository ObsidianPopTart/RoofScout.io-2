import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getScanWithLeads, getScanProgress, savePendingBuildings, appendScanChunk } from "@/lib/store";
import { findBuildings } from "@/lib/live/providers";
import { analyzeBuilding } from "@/lib/live/scan";

// How many buildings one poll analyzes before returning — bounded so a
// single request can never run long enough to hit the hosting platform's
// function timeout, whatever that happens to be. The client (ScanMap.tsx)
// already polls this endpoint every few seconds while a scan is
// "processing", so that polling loop doubles as the driver for the scan
// itself: each GET here does one small step and persists progress, instead
// of one long-running background job that a killed serverless invocation
// could silently abandon with the scan stuck "processing" forever.
const CHUNK_SIZE = Number(process.env.ROOFSCOUT_SCAN_CHUNK_SIZE ?? 12);

// The one-time OSM building lookup gets a single short-timeout attempt per
// poll rather than the full multi-mirror retry sweep — same reasoning, and
// a slow/down mirror gets retried by the client's next poll a few seconds
// later instead of holding one request open for up to a minute.
const DISCOVERY_TIMEOUT_MS = 8000;

// Polled by the scan map's own poll loop (pollUntilDone, right after it
// starts a scan) while a live scan is still running — that's the only
// caller passing ?advance=1, and the only one allowed to make this route do
// (billable) work. Every other caller — restoring a scan from a lead's
// profile link, the browser's Back button, someone just refreshing the page
// — gets a read-only status/results snapshot. Without this split, merely
// looking at an unfinished scan would silently resume Solar/vision calls on
// it, charging real API cost for something nobody asked for.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;
  const { id } = await params;
  const shouldAdvance = new URL(request.url).searchParams.get("advance") === "1";

  const progress = await getScanProgress(orgId, id);
  if (!progress) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  if (shouldAdvance && progress.status === "processing") {
    try {
      if (!progress.buildingsFetched) {
        const buildings = await findBuildings(progress.bounds, { passes: 1, timeoutMs: DISCOVERY_TIMEOUT_MS });
        await savePendingBuildings(orgId, id, buildings);
      } else if (progress.pendingBuildings && progress.pendingBuildings.length > 0) {
        const chunk = progress.pendingBuildings.slice(0, CHUNK_SIZE);
        const remaining = progress.pendingBuildings.slice(CHUNK_SIZE);
        const results = await Promise.allSettled(chunk.map((b) => analyzeBuilding(b)));
        const drafts = results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
        for (const r of results) {
          if (r.status === "rejected") console.error("Building analysis failed:", r.reason);
        }
        await appendScanChunk(orgId, id, drafts, remaining);
      }
    } catch (err) {
      // A single failed step (e.g. every Overpass mirror unreachable right
      // now) isn't fatal on its own — leave status "processing" and let the
      // client's next poll retry. The client gives up after its own
      // MAX_WAIT_MS if this genuinely never recovers.
      console.error("Scan step failed, will retry on next poll:", err);
    }
  }

  const result = await getScanWithLeads(orgId, id);
  if (!result) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
