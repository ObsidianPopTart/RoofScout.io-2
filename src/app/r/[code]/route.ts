import { NextResponse } from "next/server";

// Shareable referral link (roof-scout.org/r/CODE) — just a clean redirect
// onto /signup?ref=CODE. Kept as a dumb redirect rather than a page so the
// signup form (with its existing validation/transaction logic) stays the
// single place referral codes are actually consumed.
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/signup?ref=${encodeURIComponent(code)}`, url.origin));
}
