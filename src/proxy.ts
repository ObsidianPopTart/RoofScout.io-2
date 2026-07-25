import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Next.js 16 renamed middleware.ts -> proxy.ts (the exported name doesn't
// matter to Next.js, only the file name and that a function is exported —
// see node_modules/next/dist/docs/.../proxy.md). Built from the
// provider-free authConfig (not src/lib/auth.ts) so this stays free of
// Prisma's native binary — required for Netlify's middleware runtime, which
// can't load native addons. Gating logic lives in authConfig's `authorized`
// callback. This is only the outer gate — every API route independently
// re-checks the session too.
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  matcher: ["/app/:path*"],
};
