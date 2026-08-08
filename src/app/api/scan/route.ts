import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runMockScan, createProcessingScan } from "@/lib/store";
import { isLiveMode } from "@/lib/live/config";
import { checkAndIncrementScanUsage, normalizePlanTier, ScanLimitExceededError } from "@/lib/usage";
import { isScanAreaTooLarge, maxScanAreaKm2 } from "@/lib/scanBounds";
import type { ScanBounds } from "@/lib/types";

// A live scan chains an OSM building lookup, then Solar API + image fetch +
// Claude vision grading across every building in the visible area — for a
// dense area that's hundreds of buildings, far past what any single
// serverless invocation should be trusted to finish in one shot (a
// platform-killed function never gets to report failure, so the scan would
// be stuck "processing" forever with no error and no retry). Instead this
// route only creates the scan record; GET /api/scan/[id] — already polled by
// the client every few seconds while a scan is running — does the actual
// work one small step at a time.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

  let bounds: ScanBounds;
  let stormSourceLabel: string | undefined;
  try {
    const body = (await request.json()) as Partial<ScanBounds> & { stormSourceLabel?: unknown };
    const { north, south, east, west } = body;
    if (
      typeof north !== "number" ||
      typeof south !== "number" ||
      typeof east !== "number" ||
      typeof west !== "number" ||
      north <= south ||
      east <= west
    ) {
      return NextResponse.json({ error: "Invalid scan bounds" }, { status: 400 });
    }
    bounds = { north, south, east, west };
    // Optional label from the Storm Feed (e.g. "Dallas Hail 1.75in") — capped
    // and type-checked since it ends up in a stored ScanRecord field.
    if (typeof body.stormSourceLabel === "string" && body.stormSourceLabel.trim()) {
      stormSourceLabel = body.stormSourceLabel.trim().slice(0, 80);
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } });
  const planTier = normalizePlanTier(org.planTier);
  const maxAreaKm2 = maxScanAreaKm2(planTier);

  if (isScanAreaTooLarge(bounds, planTier)) {
    return NextResponse.json(
      {
        error: "scan_area_too_large",
        message:
          planTier === "free"
            ? `Free plan scans are capped at ${maxAreaKm2} km² — zoom in to a smaller block, or upgrade for full-neighborhood scans.`
            : `That area is too large for one scan (max ${maxAreaKm2} km²). Zoom in to a smaller neighborhood and try again.`,
      },
      { status: 400 }
    );
  }

  try {
    await checkAndIncrementScanUsage(orgId);
  } catch (err) {
    if (err instanceof ScanLimitExceededError) {
      return NextResponse.json(
        {
          error: err.planTier === "free" ? "free_scan_limit_reached" : "monthly_scan_limit_reached",
          message: `${err.message}. Upgrade to continue.`,
          planTier: err.planTier,
        },
        { status: 402 }
      );
    }
    throw err;
  }

  try {
    if (isLiveMode()) {
      const scan = await createProcessingScan(orgId, bounds, stormSourceLabel ?? "Live scan");
      return NextResponse.json({ scan, leads: [] });
    }

    // Demo mode: simulate imagery-analysis latency so the scanning state is visible.
    await new Promise((r) => setTimeout(r, 1200));
    const result = await runMockScan(orgId, bounds, stormSourceLabel);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 502 }
    );
  }
}
