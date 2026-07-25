import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllLeads, getLeadsByIds } from "@/lib/store";
import { leadsToCsv } from "@/lib/csv";

// GET /api/leads/export?ids=L-1001,L-1002  (omit ids to export every lead)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  const leads = idsParam
    ? await getLeadsByIds(orgId, idsParam.split(",").map((s) => s.trim()).filter(Boolean))
    : await getAllLeads(orgId);

  const csv = leadsToCsv(leads);
  const filename = `roofscout-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
