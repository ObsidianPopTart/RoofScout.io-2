import Link from "next/link";
import Logo from "@/components/Logo";
import LunchboxBadge from "@/components/LunchboxBadge";
import LocaleToggle from "@/components/LocaleToggle";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/lib/i18n/getLocale";
import type { Metadata } from "next";

const SITE_URL = "https://roofscout.io";
const PAGE_URL = `${SITE_URL}/ai-roofing-lead-generation-software`;

export const metadata: Metadata = {
  title: "AI Roofing Lead Generation Software",
  description:
    "RoofScout.io is AI roofing lead generation software that scans a neighborhood by satellite, grades every roof's condition, and hands your sales team a ranked, priced lead list — before anyone drives the street.",
  alternates: { canonical: "/ai-roofing-lead-generation-software" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RoofScout.io",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, Android",
  description:
    "AI roofing lead generation software: scans neighborhoods via satellite imagery, grades roof condition with AI vision, and builds a ranked, priced lead list for roofing sales teams.",
  url: PAGE_URL,
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "USD" },
    { "@type": "Offer", name: "Apex", price: "149", priceCurrency: "USD" },
  ],
};

const FAQS = [
  {
    q: "What is AI roofing lead generation software?",
    a: "It's software that identifies which homes in an area actually need roofing work — using satellite imagery and AI — instead of relying on door-knocking or purchased contact lists to find leads. RoofScout.io is built specifically for this: it scans a neighborhood, grades every rooftop's visible condition with AI, and returns a ranked list of the roofs worth a visit.",
  },
  {
    q: "How is this different from a measurement tool like EagleView or Hover?",
    a: "Measurement tools need an address first — they tell you the dimensions of a roof you've already identified. RoofScout.io works a step earlier: it finds which addresses in an area are worth measuring at all, by grading every rooftop's condition across a whole neighborhood at once.",
  },
  {
    q: "Does it replace door-knocking?",
    a: "No — it replaces guessing which doors to knock on. RoofScout.io tells your team which specific roofs look neglected before anyone drives the street, so canvassing time goes toward houses that actually need work instead of a random block.",
  },
  {
    q: "How accurate is the AI condition grading?",
    a: "Each rooftop is graded by an AI vision model against the same visible cues a human inspector looks for from the ground — staining, missing or lifted shingles, moss, sagging rooflines — and returns a specific written assessment, not just a generic damage flag. It's a screening tool to prioritize which roofs deserve an in-person look, not a replacement for a physical inspection.",
  },
  {
    q: "What does it cost?",
    a: "Free to try with 3 scans and no card required. Pro is $49/mo for 50 scans/month. Apex is $149/mo for unlimited scans plus Storm Tracker, which targets scans to areas hit by recent severe weather.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
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
    { "@type": "ListItem", position: 2, name: "AI Roofing Lead Generation Software", item: PAGE_URL },
  ],
};

export default async function AIRoofingLeadGenPage() {
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col bg-[var(--rs-ink)] text-[var(--rs-paper)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
            <Logo />
            <span className="hidden sm:inline">RoofScout.io</span>
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-5">
            <Link href="/blog" className="whitespace-nowrap text-[var(--rs-paper)]/70 hover:text-[var(--rs-paper)]">
              Blog
            </Link>
            <Link href="/pricing" className="whitespace-nowrap text-[var(--rs-paper)]/70 hover:text-[var(--rs-paper)]">
              {t.nav.pricing}
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
          </div>
        </div>
      </nav>

      <main className="rs-grid mx-auto w-full max-w-3xl px-4 pt-12 pb-24">
        <Reveal>
          <div className="font-mono text-xs tracking-widest text-[var(--rs-scan)]">AI ROOFING LEAD GENERATION SOFTWARE</div>
          <h1 className="mt-3 text-4xl leading-[0.98] font-black tracking-tight sm:text-5xl">
            Find the roofs that actually need work — before you drive the street.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
            RoofScout.io is AI roofing lead generation software built for one specific job: scanning a whole
            neighborhood at once — satellite imagery, Google Solar measurement data, and AI vision grading of every
            rooftop in view — and handing your sales team a ranked, priced list of the roofs worth a knock. No
            purchased contact lists, no blind canvassing.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-full bg-[var(--rs-amber)] px-6 py-3 font-bold text-[#1a1206] transition-transform hover:-translate-y-0.5"
          >
            Start Free — 3 Scans, No Card Required
          </Link>
        </Reveal>

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">
          What makes it &ldquo;AI&rdquo; lead generation, specifically
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          Most roofing lead sources are either purchased contact lists (no idea what condition the roof is actually
          in) or manual canvassing (real signal, but you&apos;re driving blind until you&apos;re standing in front of the
          house). RoofScout.io closes that gap: an AI vision model inspects a close-up satellite photo of every rooftop
          in the scanned area and writes a specific condition assessment — staining, missing or lifted shingles,
          moss, sagging rooflines — the same cues an inspector looks for from the ground. Roofs that read as healthy
          get filtered out automatically; the rest come back ranked by how urgent they look.
        </p>

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">How a scan actually works</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          <li>Pan and zoom the map to the neighborhood you want to work.</li>
          <li>Click &ldquo;Scan visible area&rdquo; — RoofScout.io pulls every building in view and grades each one.</li>
          <li>Get back a ranked, priced lead list with a satellite photo and AI condition summary per roof.</li>
        </ol>

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">Pricing</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          <li>Free: 3 scans total, no card required</li>
          <li>Pro: $49/mo, 50 scans/month</li>
          <li>Apex: $149/mo, unlimited scans + Storm Tracker (targets scans to active severe weather)</li>
        </ul>

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">
          Where this fits next to your other tools
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          RoofScout.io isn&apos;t a measurement or estimating tool, and it isn&apos;t trying to be — it&apos;s the step before those.
          Once RoofScout.io narrows a neighborhood down to the roofs actually worth a visit, an aerial measurement tool
          or your CRM takes over from there.
        </p>
        <Link
          href="/blog/best-ai-roofing-tools-2026"
          className="mt-4 inline-block text-lg font-semibold text-[var(--rs-amber)] underline-offset-4 hover:underline"
        >
          → See how RoofScout.io compares to Roofr, EagleView, Hover, and GAF QuickMeasure
        </Link>

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">Questions</h2>
        <div className="mt-4 space-y-6">
          {FAQS.map((item) => (
            <div key={item.q}>
              <p className="text-lg font-bold">{item.q}</p>
              <p className="mt-1 text-lg leading-relaxed text-[var(--rs-paper)]/75">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6">
          <p className="text-lg font-bold">Stop guessing which roofs need work.</p>
          <p className="mt-2 text-[var(--rs-paper)]/60">
            RoofScout.io scans a neighborhood by satellite and hands your team a ranked, priced lead list. Free to try,
            3 scans included.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded-full bg-[var(--rs-amber)] px-6 py-3 font-bold text-[#1a1206] transition-transform hover:-translate-y-0.5"
          >
            Start Free
          </Link>
        </div>
      </main>

      <footer className="mt-auto border-t border-white/10 py-6 text-center font-mono text-xs text-[var(--rs-paper)]/40">
        RoofScout.io ·{" "}
        <Link href="/privacy" className="underline hover:text-[var(--rs-paper)]/70">
          Privacy Policy
        </Link>
        <LunchboxBadge />
      </footer>
    </div>
  );
}
