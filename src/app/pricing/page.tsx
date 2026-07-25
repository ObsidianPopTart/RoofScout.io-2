import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import { getDictionary } from "@/lib/i18n/getLocale";

export const metadata = { title: "Pricing — RoofScout" };

const PLAN_KEYS = ["free", "pro", "apex"] as const;
const PLAN_META = {
  free: { price: "$0" },
  pro: { price: "$49", period: "/mo", highlight: true },
  apex: { price: "$149", period: "/mo" },
} as const;

export default async function PricingPage() {
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <nav className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Logo />
            RoofScout
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-400"
            >
              {t.nav.signup}
            </Link>
            <LocaleToggle
              locale={locale}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500"
            />
            <ThemeToggle className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t.pricing.title}</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{t.pricing.sub}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PLAN_KEYS.map((key) => {
            const meta = PLAN_META[key];
            const copy = t.pricing[key];
            const highlight = "highlight" in meta && meta.highlight;
            return (
              <div
                key={key}
                className={`rounded-2xl border p-6 ${
                  highlight
                    ? "border-amber-500 bg-white ring-1 ring-amber-500 dark:bg-slate-900"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="text-lg font-semibold">{copy.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{meta.price}</span>
                  {"period" in meta && <span className="text-slate-500 dark:text-slate-400">{meta.period}</span>}
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{copy.detail}</div>
                <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {copy.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-amber-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
                    highlight
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                      : "border border-slate-300 text-slate-900 hover:border-slate-400 dark:border-slate-700 dark:text-white dark:hover:border-slate-500"
                  }`}
                >
                  {copy.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-500">{t.pricing.footnote}</p>
      </section>

      <footer className="mt-auto border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
        RoofScout ·{" "}
        <Link href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
