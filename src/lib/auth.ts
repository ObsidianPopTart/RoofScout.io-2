import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { authConfig } from "./auth.config";
import { generateUniqueReferralCode } from "./referral";

// Google is only registered when its credentials are actually configured, so
// a deployment with no OAuth keys set up just falls back to email/password —
// no crash, no dead "Continue with Google" button.
const oauthProviders: Provider[] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

function deriveOrgName(email: string, name?: string | null): string {
  const base = name?.trim() || email.split("@")[0];
  return `${base}'s Team`;
}

// Auto-provisions an Organization + User + Membership for a first-time
// Google sign-in, mirroring the transaction in src/app/signup/page.tsx (minus
// the password, since OAuth accounts have none). Credentials sign-in never
// reaches this — that account is already created by the signup form.
async function provisionOAuthAccount(email: string, name?: string | null): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  await prisma.$transaction(async (tx) => {
    const referralCode = await generateUniqueReferralCode(tx);
    const org = await tx.organization.create({ data: { name: deriveOrgName(email, name), referralCode } });
    const user = await tx.user.create({ data: { email, passwordHash: null, name: name ?? null } });
    await tx.membership.create({ data: { userId: user.id, orgId: org.id, role: "Owner" } });
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
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
        if (!user || !user.passwordHash) return null; // no passwordHash = OAuth-only account

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
    ...oauthProviders,
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase().trim();
        if (!email) return false;
        await provisionOAuthAccount(email, user.name);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // `user`/`account` are only present on the initial sign-in call.
      if (user) {
        if (account?.provider === "google") {
          // Credentials' authorize() returns orgId/orgName/role directly, but
          // OAuth providers only give us the raw profile — look up the
          // membership provisionOAuthAccount just created (or already existed).
          const email = user.email?.toLowerCase().trim();
          const dbUser = email
            ? await prisma.user.findUnique({
                where: { email },
                include: { memberships: { include: { org: true }, take: 1 } },
              })
            : null;
          const membership = dbUser?.memberships[0];
          if (dbUser && membership) {
            token.id = dbUser.id;
            token.orgId = membership.orgId;
            token.orgName = membership.org.name;
            token.role = membership.role;
          }
        } else {
          token.id = user.id;
          token.orgId = user.orgId;
          token.orgName = user.orgName;
          token.role = user.role;
        }
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
