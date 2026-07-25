import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/getLocale";
import Logo from "@/components/Logo";

export const metadata = { title: "Log in — RoofScout" };

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/app" });
  } catch (error) {
    // AuthError (bad credentials) redirects back with an error flag; any
    // other error — including Next's internal successful-redirect signal —
    // must be rethrown, not swallowed, or a successful login never redirects.
    if (error instanceof AuthError) {
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
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-16 text-white">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <Logo />
        RoofScout
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-black tracking-tight">{t.login.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{t.login.welcome}</p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">
            Wrong email or password.
          </p>
        )}

        <form action={loginAction} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              {t.signup.email}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              {t.signup.password}
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400"
          >
            {t.login.title}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          {t.login.noAccount}{" "}
          <Link href="/signup" className="font-medium text-amber-400 hover:text-amber-300">
            {t.login.signup}
          </Link>
        </p>
      </div>
    </div>
  );
}
