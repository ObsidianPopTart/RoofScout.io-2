import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import LunchboxBadge from "@/components/LunchboxBadge";
import LocaleToggle from "@/components/LocaleToggle";
import ScanHero from "@/components/ScanHero";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/lib/i18n/getLocale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Neglected Roofs Before Your Competitors Do",
  description:
    "RoofScout scans a neighborhood by satellite, grades every roof's condition with AI, and hands your sales team a ranked, priced lead list — automatically. Free to try, 3 scans included.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RoofScout",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, Android",
  description:
    "AI-powered roofing lead generation: scans neighborhoods via satellite imagery, grades roof condition, and builds a ranked, priced lead list for roofing sales teams.",
  url: "https://roofscout.io",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "USD" },
    { "@type": "Offer", name: "Apex", price: "149", priceCurrency: "USD" },
  ],
};

export default async function MarketingHomePage() {
  const { locale, t } = await getDictionary();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.home.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="flex flex-1 flex-col bg-[var(--rs-ink)] text-[var(--rs-paper)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Background: real aerial neighborhood footage (Pexels, royalty-free,
          no attribution required) — dimmed so foreground text stays legible,
          and skipped entirely for prefers-reduced-motion. A top-level,
          non-isolated fixed sibling (not nested inside a section) so its
          negative z-index reliably stacks behind every section below,
          instead of getting trapped inside a nested stacking context. Fixed
          (not absolute) so it's viewport-sized, not just this column's
          max-w-6xl width, and stays pinned in place as the page scrolls. */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-neighborhood-video-poster.jpg)" }}
        />
        <video
          className="hero-bg-video absolute inset-0 hidden h-full w-full object-cover md:block"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-neighborhood-video-poster.jpg"
        >
          <source src="/videos/hero-neighborhood.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-[var(--rs-ink)]" />
      </div>

      <nav className="relative z-10">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
            <Logo />
            <span className="hidden sm:inline">RoofScout</span>
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-5">
            <Link href="/blog" className="hidden text-[var(--rs-paper)]/70 hover:text-[var(--rs-paper)] sm:inline">
              Blog
            </Link>
            <Link href="/pricing" className="hidden text-[var(--rs-paper)]/70 hover:text-[var(--rs-paper)] sm:inline">
              {t.nav.pricing}
            </Link>
            <Link href="/login" className="whitespace-nowrap text-[var(--rs-paper)]/70 hover:text-[var(--rs-paper)]">
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="group relative shrink-0 overflow-hidden rounded-full bg-[var(--rs-amber)] px-4 py-2 whitespace-nowrap font-semibold text-[#1a1206] sm:px-5"
            >
              <span className="relative z-10">{t.nav.signup}</span>
              <span className="absolute inset-0 -translate-x-full bg-[var(--rs-scan)] transition-transform duration-300 group-hover:translate-x-0" />
            </Link>
            <LocaleToggle
              locale={locale}
              className="hidden rounded-md border border-white/15 px-2 py-1 font-mono text-xs text-[var(--rs-paper)]/60 hover:border-white/30 sm:inline-block"
            />
          </div>
        </div>
      </nav>

      {/* Hero — a live-scan viewport, not a stock photo with text next to it */}
      <section className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 pt-8 pb-20 lg:grid-cols-[1.15fr_1fr] lg:pt-14 lg:pb-24">
        <div>
          <div
            className="rs-fade-up mb-5 inline-flex items-center gap-2 font-mono text-xs tracking-widest text-[var(--rs-scan)]"
          >
            <span className="rs-blink h-1.5 w-1.5 rounded-full bg-[var(--rs-scan)]" aria-hidden />
            LIVE AERIAL SCAN
          </div>
          <h1
            className="rs-fade-up text-5xl leading-[0.98] font-black tracking-tight sm:text-6xl lg:text-[4.25rem]"
            style={{ animationDelay: "0.1s" }}
          >
            {t.home.headline}
          </h1>
          <p
            className="rs-fade-up mt-6 max-w-md text-lg text-[var(--rs-paper)]/60"
            style={{ animationDelay: "0.28s" }}
          >
            {t.home.sub}
          </p>
          <div className="rs-fade-up mt-8 flex flex-wrap gap-4" style={{ animationDelay: "0.44s" }}>
            <Link
              href="/signup"
              className="rounded-full bg-[var(--rs-amber)] px-8 py-4 text-base font-bold text-[#1a1206] transition-transform hover:-translate-y-0.5"
            >
              {t.home.startFree}
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-8 py-4 text-base font-bold text-[var(--rs-paper)] transition-colors hover:border-white/45"
            >
              {t.home.login}
            </Link>
          </div>
          <ul
            className="rs-fade-up mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs tracking-wide text-[var(--rs-paper)]/50"
            style={{ animationDelay: "0.5s" }}
          >
            {t.home.trustBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-1.5">
                <span className="text-[var(--rs-scan)]" aria-hidden>
                  ✓
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="rs-fade-up" style={{ animationDelay: "0.2s" }}>
          <ScanHero />
        </div>
      </section>

      {/* Feature — warm paper section, roof close-up in a specimen frame */}
      <section className="bg-[var(--rs-paper)] text-[#1a1206]">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <Reveal className="lg:order-2">
            <div className="border border-black/10 p-2">
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <Image
                  src="/images/roof-tiles-closeup.jpg"
                  alt="Close-up of weathered roof tiles showing wear and moss"
                  fill
                  className="object-cover grayscale-[15%]"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <p className="px-1 pt-2 font-mono text-[11px] tracking-wide text-black/50">
                SPECIMEN 04 · WEATHERED ASPHALT SHINGLE
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="mb-4 font-mono text-xs tracking-widest text-[#8a5a2b]">CONDITION GRADING</div>
            <h2 className="text-3xl leading-[1.02] font-black tracking-tight sm:text-5xl">
              {t.home.featureHeadline}
            </h2>
            <p className="mt-6 max-w-md text-lg text-black/60">{t.home.featureBody}</p>
          </Reveal>
        </div>
      </section>

      {/* How it works — three-step process, builds confidence before the ask */}
      <section className="bg-[var(--rs-ink)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 lg:py-28">
          <Reveal>
            <div className="mb-2 font-mono text-xs tracking-widest text-[var(--rs-paper)]/50">PROCESS</div>
            <h2 className="text-3xl leading-[1.02] font-black tracking-tight sm:text-5xl">
              {t.home.howItWorksTitle}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {t.home.howItWorks.map((step, i) => (
              <Reveal key={step.title} delay={i * 80}>
                <div className="font-mono text-sm text-[var(--rs-scan)]">0{i + 1}</div>
                <h3 className="mt-3 text-xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-[var(--rs-paper)]/60">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Statement — dark, scan-result framing */}
      <section className="bg-[var(--rs-ink-2)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 lg:py-28">
          <Reveal>
            <div className="mb-5 flex items-center gap-2 font-mono text-xs tracking-widest text-[var(--rs-scan)]">
              <span aria-hidden>→</span> RESULT
            </div>
            <p className="max-w-4xl text-3xl leading-[1.08] font-black tracking-tight sm:text-5xl lg:text-6xl">
              {t.home.statement}
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ — objection handling, doubles as FAQPage schema */}
      <section className="bg-[var(--rs-ink-2)]">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 lg:py-28">
          <Reveal>
            <div className="mb-2 font-mono text-xs tracking-widest text-[var(--rs-paper)]/50">QUESTIONS</div>
            <h2 className="text-3xl leading-[1.02] font-black tracking-tight sm:text-5xl">{t.home.faqTitle}</h2>
          </Reveal>
          <div className="mt-10 divide-y divide-white/10 border-t border-white/10">
            {t.home.faq.map((item, i) => (
              <Reveal key={item.q} delay={i * 40}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                    {item.q}
                    <span className="shrink-0 text-[var(--rs-paper)]/40 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[var(--rs-paper)]/60">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="rs-grid bg-[var(--rs-ink)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-20 lg:py-28">
          <Reveal>
            <div className="mb-2 font-mono text-xs tracking-widest text-[var(--rs-paper)]/50">GET STARTED</div>
            <h2 className="text-4xl leading-[0.98] font-black tracking-tight sm:text-6xl">{t.home.finalCta}</h2>
            <p className="mt-4 text-lg text-[var(--rs-paper)]/60">{t.home.finalCtaSub}</p>
            <Link
              href="/signup"
              className="mt-7 inline-block rounded-full bg-[var(--rs-amber)] px-8 py-4 text-base font-bold text-[#1a1206] transition-transform hover:-translate-y-0.5"
            >
              {t.home.startFree}
            </Link>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs tracking-wide text-[var(--rs-paper)]/50">
              {t.home.trustBullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-1.5">
                  <span className="text-[var(--rs-scan)]" aria-hidden>
                    ✓
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[var(--rs-ink)] py-6 text-center font-mono text-xs text-[var(--rs-paper)]/40">
        RoofScout ·{" "}
        <Link href="/blog" className="underline hover:text-[var(--rs-paper)]/70">
          Blog
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="underline hover:text-[var(--rs-paper)]/70">
          Privacy Policy
        </Link>
        <LunchboxBadge />
      </footer>
    </div>
  );
}
