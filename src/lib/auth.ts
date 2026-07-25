import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { memberships: { include: { org: true }, take: 1 } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const membership = user.memberships[0];
        if (!membership) return null; // orphaned user with no org — shouldn't happen post-signup

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          orgId: membership.orgId,
          orgName: membership.org.name,
          role: membership.role,
        };
      },
    }),
  ],
  callbacks: {
    // Gate the /app/* tree. This is the "outer" check only — every API route
    // still re-checks the session independently (see src/proxy.ts and the
    // Next.js docs' own warning that a matcher change can silently drop
    // Proxy coverage; never rely on this alone).
    authorized({ auth, request }) {
      const isAppRoute = request.nextUrl.pathname.startsWith("/app");
      if (!isAppRoute) return true;
      return Boolean(auth?.user);
    },
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in call; persist the
      // multi-tenant fields onto the token for subsequent requests.
      if (user) {
        token.id = user.id;
        token.orgId = user.orgId;
        token.orgName = user.orgName;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.orgId = token.orgId;
      session.user.orgName = token.orgName;
      session.user.role = token.role;
      return session;
    },
  },
});
