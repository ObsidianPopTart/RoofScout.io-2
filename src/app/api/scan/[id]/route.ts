import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getScanWithLeads } from "@/lib/store";

// Polled by the scan map while a live scan's background analysis (kicked
// off in /api/scan) is still running.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getScanWithLeads(session.user.orgId, id);
  if (!result) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
