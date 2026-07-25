import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/getLocale";

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
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t.login.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.login.welcome}</p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            Wrong email or password.
          </p>
        )}

        <form action={loginAction} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t.signup.email}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t.signup.password}
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            {t.login.title}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {t.login.noAccount}{" "}
          <Link href="/signup" className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
            {t.login.signup}
          </Link>
        </p>
      </div>
    </div>
  );
}
