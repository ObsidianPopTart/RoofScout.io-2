import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isLiveMode } from "@/lib/live/config";
import { forwardGeocode } from "@/lib/live/providers";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const address = new URL(request.url).searchParams.get("address")?.trim();
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  if (!isLiveMode()) {
    return NextResponse.json(
      { error: "Address search needs live mode (GOOGLE_MAPS_API_KEY) to be configured." },
      { status: 503 }
    );
  }

  const result = await forwardGeocode(address);
  if (!result) {
    return NextResponse.json({ error: "Couldn't find that address" }, { status: 404 });
  }

  return NextResponse.json(result);
}
