import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import { getDictionary } from "@/lib/i18n/getLocale";

export const metadata = {
  title: "Pricing",
  description:
    "Simple, scan-based pricing. Start free with 3 scans — no card required. Upgrade to Pro ($49/mo, 50 scans) or Apex ($149/mo, unlimited) anytime.",
  alternates: { canonical: "/pricing" },
};

const PLAN_KEYS = ["free", "pro", "apex"] as const;
const PLAN_META = {
  free: { price: "$0" },
  pro: { price: "$49", period: "/mo", highlight: true },
  apex: { price: "$149", period: "/mo" },
} as const;

const SITE_URL = "https://roof-scout.org";

export default async function PricingPage() {
  const { locale, t } = await getDictionary();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.pricing.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/pricing` },
    ],
  };

  return (
    <div className="flex flex-1 flex-col bg-[var(--rs-ink)] text-[var(--rs-paper)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <nav>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
            <Logo />
            <span className="hidden sm:inline">RoofScout</span>
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-5">
            <Link href="/blog" className="hidden text-[var(--rs-paper)]/70 hover:text-[var(--rs-paper)] sm:inline">
              Blog
            </Link>
            <Link href="/login" className="whitespace-nowrap text-[var(--rs-paper)]/70 hover:text-[var(--rs-paper)]">
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="shrink-0 whitespace-nowrap rounded-full bg-[var(--rs-amber)] px-4 py-2 font-semibold text-[#1a1206] sm:px-5"
            >
              {t.nav.signup}
            </Link>
            <LocaleToggle
              locale={locale}
              className="hidden rounded-md border border-white/15 px-2 py-1 font-mono text-xs text-[var(--rs-paper)]/60 hover:border-white/30 sm:inline-block"
            />
            <ThemeToggle className="hidden text-[var(--rs-paper)]/60 hover:text-[var(--rs-paper)] sm:inline-block" />
          </div>
        </div>
      </nav>

      <section className="rs-grid mx-auto w-full max-w-5xl px-4 pt-12 pb-20">
        <div className="rs-fade-up font-mono text-xs tracking-widest text-[var(--rs-scan)]">PLANS</div>
        <h1
          className="rs-fade-up mt-3 text-5xl leading-[0.95] font-black tracking-tighter sm:text-7xl"
          style={{ animationDelay: "0.08s" }}
        >
          {t.pricing.title}
        </h1>
        <p className="rs-fade-up mt-5 max-w-xl text-lg text-[var(--rs-paper)]/60" style={{ animationDelay: "0.16s" }}>
          {t.pricing.sub}
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PLAN_KEYS.map((key, i) => {
            const meta = PLAN_META[key];
            const copy = t.pricing[key];
            const highlight = "highlight" in meta && meta.highlight;
            return (
              <div
                key={key}
                className={`rs-fade-up rounded-2xl p-6 ${
                  highlight
                    ? "bg-[var(--rs-amber)] text-[#1a1206]"
                    : "border border-white/10 bg-[var(--rs-ink-2)]"
                }`}
                style={{ animationDelay: `${0.24 + i * 0.08}s` }}
              >
                <div className="text-lg font-bold">{copy.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">{meta.price}</span>
                  {"period" in meta && (
                    <span className={highlight ? "text-[#1a1206]/70" : "text-[var(--rs-paper)]/50"}>
                      {meta.period}
                    </span>
                  )}
                </div>
                <div className={`mt-1 text-sm ${highlight ? "text-[#1a1206]/70" : "text-[var(--rs-paper)]/50"}`}>
                  {copy.detail}
                </div>
                <ul className={`mt-5 space-y-2 text-sm ${highlight ? "text-[#1a1206]/80" : "text-[var(--rs-paper)]/70"}`}>
                  {copy.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className={highlight ? "text-[#1a1206]" : "text-[var(--rs-scan)]"}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block rounded-full px-4 py-2.5 text-center text-sm font-bold transition-transform hover:-translate-y-0.5 ${
                    highlight
                      ? "bg-[#1a1206] text-[var(--rs-paper)]"
                      : "border border-white/15 text-[var(--rs-paper)] hover:border-white/35"
                  }`}
                >
                  {copy.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-10 flex items-start gap-3 text-sm text-[var(--rs-paper)]/50">
          <span className="shrink-0 text-[var(--rs-scan)]" aria-hidden>
            →
          </span>
          {t.pricing.footnote}
        </p>

        <div className="mt-20">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{t.pricing.faqTitle}</h2>
          <div className="mt-6 divide-y divide-white/10 border-t border-white/10">
            {t.pricing.faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                  {item.q}
                  <span className="shrink-0 text-[var(--rs-paper)]/40 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[var(--rs-paper)]/60">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <p className="mt-10 text-sm text-[var(--rs-paper)]/50">
          Not sure where to start?{" "}
          <Link href="/blog/how-to-find-roofing-leads" className="underline hover:text-[var(--rs-paper)]/80">
            Read how roofing teams generate leads
          </Link>{" "}
          before you pick a plan.
        </p>
      </section>

      <footer className="mt-auto border-t border-white/10 py-6 text-center font-mono text-xs text-[var(--rs-paper)]/40">
        RoofScout ·{" "}
        <Link href="/privacy" className="underline hover:text-[var(--rs-paper)]/70">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
