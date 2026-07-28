import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/getLocale";
import { checkLoginRateLimit, getClientIp, recordFailedLogin } from "@/lib/rateLimit";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Log In",
  robots: { index: false, follow: true }, // utility page, no unique SEO value — avoid thin-content indexing
};

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const ip = await getClientIp();

  // Checked before touching bcrypt/NextAuth at all — a blocked attempt
  // costs nothing and never even names which part (email vs password) was
  // wrong, on top of the generic "invalid" message already used below.
  const { allowed } = await checkLoginRateLimit(email, ip);
  if (!allowed) {
    redirect("/login?error=rate_limited");
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/app" });
  } catch (error) {
    // AuthError (bad credentials) redirects back with an error flag; any
    // other error — including Next's internal successful-redirect signal —
    // must be rethrown, not swallowed, or a successful login never redirects.
    if (error instanceof AuthError) {
      await recordFailedLogin(email, ip);
      redirect("/login?error=invalid");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--rs-ink)] px-4 py-16 text-[var(--rs-paper)]">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <Logo />
        RoofScout
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6">
        <h1 className="text-2xl font-black tracking-tight">{t.login.title}</h1>
        <p className="mt-1 text-sm text-[var(--rs-paper)]/60">{t.login.welcome}</p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-900/60 bg-red-950/60 px-3 py-2 text-sm text-red-300">
            {error === "rate_limited"
              ? "Too many attempts — please wait a few minutes and try again."
              : "Wrong email or password."}
          </p>
        )}

        <form action={loginAction} className="mt-5 space-y-4">
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
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-[var(--rs-paper)] focus:border-[var(--rs-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-amber)]/25"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[var(--rs-amber)] px-4 py-2.5 text-sm font-bold text-[#1a1206] transition-transform hover:-translate-y-0.5"
          >
            {t.login.title}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--rs-paper)]/60">
          {t.login.noAccount}{" "}
          <Link href="/signup" className="font-medium text-[var(--rs-amber)] hover:brightness-110">
            {t.login.signup}
          </Link>
        </p>
      </div>
    </div>
  );
}
