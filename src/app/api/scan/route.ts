import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runMockScan } from "@/lib/store";
import { runLiveScan } from "@/lib/live/scan";
import { isLiveMode } from "@/lib/live/config";
import { checkAndIncrementScanUsage, ScanLimitExceededError } from "@/lib/usage";
import type { ScanBounds } from "@/lib/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

  let bounds: ScanBounds;
  try {
    const body = (await request.json()) as Partial<ScanBounds>;
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
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await checkAndIncrementScanUsage(orgId);
  } catch (err) {
    if (err instanceof ScanLimitExceededError) {
      return NextResponse.json(
        { error: "monthly_scan_limit_reached", message: `Monthly scan limit of ${err.limit} reached. Upgrade to continue.` },
        { status: 402 }
      );
    }
    throw err;
  }

  try {
    if (isLiveMode()) {
      const result = await runLiveScan(orgId, bounds);
      return NextResponse.json(result);
    }

    // Demo mode: simulate imagery-analysis latency so the scanning state is visible.
    await new Promise((r) => setTimeout(r, 1200));
    const result = await runMockScan(orgId, bounds);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 502 }
    );
  }
}
