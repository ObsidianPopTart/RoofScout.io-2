import type { NextAuthConfig } from "next-auth";

// Kept free of providers/Prisma/bcryptjs so src/proxy.ts's bundle stays
// lightweight enough for Netlify's middleware runtime (no native addons
// allowed there). The full config with the Credentials provider lives in
// src/lib/auth.ts and is only imported by API routes and server components.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAppRoute = request.nextUrl.pathname.startsWith("/app");
      if (!isAppRoute) return true;
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
