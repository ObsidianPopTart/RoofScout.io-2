import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — reports only whether these env vars are
// non-empty at runtime, never their values. Delete once the Google OAuth
// env var issue on Netlify is confirmed fixed.
export async function GET() {
  return NextResponse.json({
    googleClientIdSet: Boolean(process.env.GOOGLE_CLIENT_ID),
    googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length ?? 0,
    googleClientSecretSet: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length ?? 0,
  });
}
