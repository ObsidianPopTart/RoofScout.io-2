import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateLeadStatuses } from "@/lib/store";

// POST /api/leads/route-to-marketing { ids: string[] }
// Marks the given leads "Routed" so reps can see they've been handed off,
// and returns the updated leads (the caller triggers the CSV download).
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

  let ids: string[];
  try {
    const body = (await request.json()) as { ids?: unknown };
    if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "ids must be a string array" }, { status: 400 });
    }
    ids = body.ids as string[];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (ids.length === 0) {
    return NextResponse.json({ error: "No lead ids provided" }, { status: 400 });
  }

  const updated = await updateLeadStatuses(orgId, ids, "Routed");
  return NextResponse.json({ updated: updated.length });
}
