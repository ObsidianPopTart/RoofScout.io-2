import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claimTerritory, releaseTerritory, TerritoryError } from "@/lib/territory";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { zipCode?: string } | null;
  if (typeof body?.zipCode !== "string") {
    return NextResponse.json({ error: "Missing zipCode" }, { status: 400 });
  }

  try {
    const claim = await claimTerritory(session.user.orgId, body.zipCode);
    return NextResponse.json({ claim });
  } catch (err) {
    if (err instanceof TerritoryError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "not_apex" ? 403 : 409 });
    }
    throw err;
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { claimId?: string } | null;
  if (typeof body?.claimId !== "string") {
    return NextResponse.json({ error: "Missing claimId" }, { status: 400 });
  }

  try {
    await releaseTerritory(session.user.orgId, body.claimId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof TerritoryError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
