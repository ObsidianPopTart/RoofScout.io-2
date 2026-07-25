// Next.js 16 renamed middleware.ts -> proxy.ts (the exported name doesn't
// matter to Next.js, only the file name and that a function is exported —
// see node_modules/next/dist/docs/.../proxy.md). Auth.js's `auth` export
// doubles as the proxy function; gating logic lives in the `authorized`
// callback in src/lib/auth.ts. This is only the outer gate — every API
// route independently re-checks the session too.
export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/app/:path*"],
};
