import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchRoofImage } from "@/lib/live/providers";
import { isLiveMode } from "@/lib/live/config";

// Proxies Google satellite tiles so the Maps API key stays server-side.
// Requires a session (not org-scoped data, but it's a real cost against the
// operator's own Google quota — no anonymous internet user should be able
// to use it as a free image-proxy relay).
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isLiveMode()) {
    return NextResponse.json({ error: "Live imagery requires GOOGLE_MAPS_API_KEY" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const image = await fetchRoofImage(lat, lng);
  if (!image) {
    return NextResponse.json({ error: "Imagery unavailable" }, { status: 502 });
  }

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
