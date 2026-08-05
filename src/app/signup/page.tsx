import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { generateUniqueReferralCode, resolveReferrerOrgId } from "@/lib/referral";
import { getDictionary } from "@/lib/i18n/getLocale";
import Logo from "@/components/Logo";
import OAuthButtons from "@/components/OAuthButtons";

export const metadata = {
  title: "Sign Up",
  description: "Start free with 3 satellite roof scans — no card required.",
  alternates: { canonical: "/signup" },
};

const signupSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  ref: z.string().trim().optional(),
});

async function signupAction(formData: FormData) {
  "use server";

  const parsed = signupSchema.safeParse({
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    password: formData.get("password"),
    ref: formData.get("ref") || undefined,
  });
  if (!parsed.success) {
    const refParam = typeof formData.get("ref") === "string" ? `&ref=${encodeURIComponent(String(formData.get("ref")))}` : "";
    redirect(`/signup?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}${refParam}`);
  }
  const { companyName, email, password, ref } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/signup?error=" + encodeURIComponent("An account with that email already exists"));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // Resolved outside the transaction — a bad/unknown ref code should never
  // block signup, so this just falls back to null (no referrer).
  const referredByOrgId = await resolveReferrerOrgId(ref);

  await prisma.$transaction(async (tx) => {
    const referralCode = await generateUniqueReferralCode(tx);
    const org = await tx.organization.create({ data: { name: companyName, referralCode, referredByOrgId } });
    const user = await tx.user.create({ data: { email, passwordHash } });
    await tx.membership.create({ data: { userId: user.id, orgId: org.id, role: "Owner" } });
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/app" });
  } catch (error) {
    if (error instanceof AuthError) {
      // Account was created successfully; login failing right after would be
      // a bug in the sign-in flow itself, not a user input problem.
      redirect("/login?error=invalid");
    }
    throw error;
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ref?: string }>;
}) {
  const { error, ref } = await searchParams;
  const { t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--rs-ink)] px-4 py-16 text-[var(--rs-paper)]">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <Logo />
        RoofScout.io
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6">
        <h1 className="text-2xl font-black tracking-tight">{t.signup.title}</h1>
        <p className="mt-1 text-sm text-[var(--rs-paper)]/60">{t.signup.sub}</p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-900/60 bg-red-950/60 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {ref && (
          <p className="mt-4 rounded-lg border border-[var(--rs-amber)]/30 bg-[var(--rs-amber)]/10 px-3 py-2 text-sm text-[var(--rs-amber)]">
            {t.signup.referralNotice}
          </p>
        )}

        <form action={signupAction} className="mt-5 space-y-4">
          {ref && <input type="hidden" name="ref" value={ref} />}
          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-[var(--rs-paper)]/50">
              {t.signup.companyName}
            </label>
            <input
              type="text"
              name="companyName"
              required
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-[var(--rs-paper)] focus:border-[var(--rs-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-amber)]/25"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-[var(--rs-paper)]/50">
              {t.signup.email}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-[var(--rs-paper)] focus:border-[var(--rs-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-amber)]/25"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-[var(--rs-paper)]/50">
              {t.signup.password}
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-[var(--rs-paper)] focus:border-[var(--rs-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-amber)]/25"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[var(--rs-amber)] px-4 py-2.5 text-sm font-bold text-[#1a1206] transition-transform hover:-translate-y-0.5"
          >
            {t.signup.cta}
          </button>
        </form>

        <OAuthButtons divider={t.oauth.divider} googleLabel={t.oauth.google} />

        <p className="mt-4 text-center text-sm text-[var(--rs-paper)]/60">
          {t.signup.haveAccount}{" "}
          <Link href="/login" className="font-medium text-[var(--rs-amber)] hover:brightness-110">
            {t.signup.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
