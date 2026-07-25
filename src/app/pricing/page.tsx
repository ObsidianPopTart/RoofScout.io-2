import Link from "next/link";

export const metadata = { title: "Pricing — RoofScout" };

const PLANS = [
  {
    name: "Free",
    price: "$0",
    detail: "3 scans, once — no card required",
    features: ["Live satellite scanning", "AI condition grading", "CSV export"],
    cta: "Start free",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    detail: "50 scans a month",
    features: ["Everything in Free", "50 scans/month", "Route leads to your marketing team"],
    cta: "Start free, upgrade anytime",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Apex",
    price: "$149",
    period: "/mo",
    detail: "Unlimited scans",
    features: ["Everything in Pro", "Unlimited scans", "Priority support"],
    cta: "Start free, upgrade anytime",
    href: "/signup",
  },
] as const;

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-950 text-white">
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold">
            RoofScout
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-400"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple, scan-based pricing</h1>
          <p className="mt-3 text-lg text-slate-300">
            Try RoofScout free, then pay for the scan volume your team actually needs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                "highlight" in plan && plan.highlight
                  ? "border-amber-500 bg-slate-900 ring-1 ring-amber-500"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              <div className="text-lg font-semibold">{plan.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {"period" in plan && <span className="text-slate-400">{plan.period}</span>}
              </div>
              <div className="mt-1 text-sm text-slate-400">{plan.detail}</div>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-amber-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
                  "highlight" in plan && plan.highlight
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                    : "border border-slate-700 text-white hover:border-slate-500"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Every plan includes live satellite scanning, AI condition grading, and CSV export.
          Upgrade or cancel anytime from your billing page.
        </p>
      </section>

      <footer className="mt-auto border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        RoofScout
      </footer>
    </div>
  );
}
