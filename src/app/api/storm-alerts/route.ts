import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizePlanTier } from "@/lib/usage";
import { fetchActiveStormAlerts } from "@/lib/weather/nws";
import { fetchRecentStormReports } from "@/lib/weather/spc";

// Storm Tracker is an Apex-tier feature — gate at the API, not just the UI.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await prisma.organization.findUniqueOrThrow({ where: { id: session.user.orgId } });
  if (normalizePlanTier(org.planTier) !== "apex") {
    return NextResponse.json({ error: "Storm Tracker is available on the Apex plan." }, { status: 403 });
  }

  const days = Number(new URL(request.url).searchParams.get("days")) || 3;

  // Active warnings (NWS) and recent ground-truth reports (SPC) are two
  // independent free data sources — fetched with allSettled so one being
  // down doesn't take out the other, and reported separately rather than
  // failing the whole request.
  const [alertsResult, reportsResult] = await Promise.allSettled([
    fetchActiveStormAlerts(),
    fetchRecentStormReports(days),
  ]);

  if (alertsResult.status === "rejected") console.error("NWS alerts fetch failed:", alertsResult.reason);
  if (reportsResult.status === "rejected") console.error("SPC reports fetch failed:", reportsResult.reason);

  if (alertsResult.status === "rejected" && reportsResult.status === "rejected") {
    return NextResponse.json({ error: "Couldn't load storm data right now — try again shortly." }, { status: 502 });
  }

  return NextResponse.json({
    alerts: alertsResult.status === "fulfilled" ? alertsResult.value : [],
    reports: reportsResult.status === "fulfilled" ? reportsResult.value : [],
  });
}
