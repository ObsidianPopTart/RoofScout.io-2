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
    <div className="flex flex-1 flex-col bg-slate-950 text-white">
      <nav>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Logo />
            RoofScout
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/login" className="text-slate-300 hover:text-white">
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-amber-500 px-5 py-2 font-semibold text-slate-950 hover:bg-amber-400"
            >
              {t.nav.signup}
            </Link>
            <LocaleToggle
              locale={locale}
              className="rounded-md border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-400 hover:border-slate-500"
            />
            <ThemeToggle className="text-slate-400 hover:text-white" />
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-5xl px-4 pt-12 pb-20">
        <h1 className="text-5xl leading-[0.95] font-black tracking-tighter sm:text-7xl">{t.pricing.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-slate-400">{t.pricing.sub}</p>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PLAN_KEYS.map((key) => {
            const meta = PLAN_META[key];
            const copy = t.pricing[key];
            const highlight = "highlight" in meta && meta.highlight;
            return (
              <div
                key={key}
                className={`rounded-2xl p-6 ${
                  highlight ? "bg-amber-500 text-slate-950" : "border border-slate-800 bg-slate-900"
                }`}
              >
                <div className="text-lg font-bold">{copy.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">{meta.price}</span>
                  {"period" in meta && (
                    <span className={highlight ? "text-slate-800" : "text-slate-400"}>{meta.period}</span>
                  )}
                </div>
                <div className={`mt-1 text-sm ${highlight ? "text-slate-800" : "text-slate-400"}`}>{copy.detail}</div>
                <ul className={`mt-5 space-y-2 text-sm ${highlight ? "text-slate-800" : "text-slate-300"}`}>
                  {copy.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className={highlight ? "text-slate-950" : "text-amber-500"}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block rounded-full px-4 py-2.5 text-center text-sm font-bold ${
                    highlight
                      ? "bg-slate-950 text-white hover:bg-slate-800"
                      : "border border-slate-700 text-white hover:border-slate-500"
                  }`}
                >
                  {copy.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-10 flex items-start gap-3 text-sm text-slate-400">
          <span className="shrink-0 text-amber-500" aria-hidden>
            →
          </span>
          {t.pricing.footnote}
        </p>
      </section>

      <footer className="mt-auto border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        RoofScout ·{" "}
        <Link href="/privacy" className="underline hover:text-slate-300">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
