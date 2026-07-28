import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizePlanTier } from "@/lib/usage";
import { fetchActiveStormAlerts } from "@/lib/weather/nws";

// Storm Tracker is an Apex-tier feature — gate at the API, not just the UI.
export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await prisma.organization.findUniqueOrThrow({ where: { id: session.user.orgId } });
  if (normalizePlanTier(org.planTier) !== "apex") {
    return NextResponse.json({ error: "Storm Tracker is available on the Apex plan." }, { status: 403 });
  }

  try {
    const alerts = await fetchActiveStormAlerts();
    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("Storm alerts fetch failed:", err);
    return NextResponse.json({ error: "Couldn't load storm alerts right now — try again shortly." }, { status: 502 });
  }
}
