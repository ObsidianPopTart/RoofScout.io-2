import Link from "next/link";
import Logo from "@/components/Logo";
import LunchboxBadge from "@/components/LunchboxBadge";
import LocaleToggle from "@/components/LocaleToggle";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/lib/i18n/getLocale";
import type { Metadata } from "next";

const SITE_URL = "https://roofscout.io";
const PAGE_URL = `${SITE_URL}/hail-damage-statistics`;
const LAST_UPDATED = "2026-08-09";

export const metadata: Metadata = {
  title: "US Hail Damage Statistics (2026 Data)",
  description:
    "Every major U.S. hail-damage statistic in one place — NICB metro rankings, state-level claim data, county hail-day records, and the costliest known hailstorms — with primary sources linked for every figure.",
  alternates: { canonical: "/hail-damage-statistics" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "US Hail Damage Statistics",
  description:
    "Aggregated U.S. hail damage and insurance claims statistics, including NICB metro-level claim rankings, state-level claim totals, county hail-day records, and the costliest known hailstorm events, sourced from NICB, State Farm, Verisk, Cotality/CoreLogic, and the Insurance Federation of Minnesota.",
  url: PAGE_URL,
  dateModified: LAST_UPDATED,
  creator: { "@type": "Organization", name: "RoofScout.io", url: SITE_URL },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Hail Damage Statistics", item: PAGE_URL },
  ],
};

interface StatRow {
  cells: string[];
}

function StatTable({ headers, rows }: { headers: string[]; rows: StatRow[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[480px] text-left text-base">
        <thead>
          <tr className="border-b border-white/10 bg-[var(--rs-ink-2)]">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-bold text-[var(--rs-paper)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              {row.cells.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[var(--rs-paper)]/75">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Source {
  label: string;
  href: string;
}

function SourceLine({ sources }: { sources: Source[] }) {
  return (
    <p className="mt-2 text-sm text-[var(--rs-paper)]/45">
      Source:{" "}
      {sources.map((s, i) => (
        <span key={s.href}>
          {i > 0 && ", "}
          <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--rs-paper)]/70">
            {s.label}
          </a>
        </span>
      ))}
    </p>
  );
}

export default async function HailDamageStatisticsPage() {
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col bg-[var(--rs-ink)] text-[var(--rs-paper)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
            <Logo />
            <span className="hidden sm:inline">RoofScout.io</span>
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
          <div className="font-mono text-xs tracking-widest text-[var(--rs-scan)]">DATA — LAST UPDATED {LAST_UPDATED}</div>
          <h1 className="mt-3 text-4xl leading-[0.98] font-black tracking-tight sm:text-5xl">
            US Hail Damage Statistics (2026)
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
            Every figure below is pulled directly from a named primary source — NICB, State Farm, Verisk, Cotality
            (formerly CoreLogic), or a state insurance trade group — with a link to that source next to the number.
            No modeled estimates presented as fact, no numbers without attribution. Compiled and maintained by{" "}
            <Link href="/" className="text-[var(--rs-amber)] underline-offset-4 hover:underline">
              RoofScout.io
            </Link>
            , which uses this same underlying research to target its{" "}
            <Link href="/blog" className="text-[var(--rs-amber)] underline-offset-4 hover:underline">
              city-specific hail market guides
            </Link>
            .
          </p>
        </Reveal>

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">National overview (2025)</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          <li>Texas recorded 902 major hail events (hail ≥1&quot; diameter) in 2025 — the most of any state, and more than double second-place Illinois (375).</li>
          <li>The U.S. recorded 5,432 major hail events nationwide in 2025.</li>
          <li>State Farm alone paid more than $5.6 billion in hail-related claims nationwide in 2025, with Texas the top state at $1.4 billion.</li>
          <li>Top 5 states for hail claims in 2025 (State Farm): Texas, Missouri, Illinois, Wisconsin, Oklahoma.</li>
          <li>Oklahoma averaged 138 severe hail days a year from 2017-2019 — second nationally, behind only Texas (Verisk/NICB analysis).</li>
        </ul>
        <SourceLine
          sources={[
            { label: "NICB: Texas hail damage capital", href: "https://www.nicb.org/news/regional-news/11th-straight-year-texas-hail-damage-capital-us" },
            { label: "State Farm 2025 hail claims release", href: "https://newsroom.statefarm.com/state-farm-paid-over-56-billion-in-hail-claims-in-2025/" },
          ]}
        />

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">
          Top U.S. metro areas for hail claims (NICB)
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          The National Insurance Crime Bureau publishes rolling three-year metro-level hail claims counts. The two
          most recent published windows:
        </p>
        <h3 className="mt-6 mb-1 text-lg font-bold">2016-2018 report</h3>
        <StatTable
          headers={["Rank", "Metro", "Hail claims"]}
          rows={[
            { cells: ["1", "San Antonio, TX", "75,187"] },
            { cells: ["2", "Colorado Springs, CO", "67,920"] },
            { cells: ["3", "Omaha, NE", "52,803"] },
            { cells: ["4", "Denver, CO", "48,357"] },
            { cells: ["5", "Plano, TX", "42,659"] },
          ]}
        />
        <h3 className="mt-6 mb-1 text-lg font-bold">2017-2019 report</h3>
        <StatTable
          headers={["Rank", "Metro", "Hail claims"]}
          rows={[
            { cells: ["1", "Omaha, NE", "54,153"] },
            { cells: ["2", "Denver, CO", "51,887"] },
            { cells: ["3", "Colorado Springs, CO", "38,044"] },
            { cells: ["4", "McKinney, TX", "34,134"] },
            { cells: ["5", "Dallas, TX", "25,262"] },
          ]}
        />
        <SourceLine sources={[{ label: "Insurance Information Institute / NICB", href: "https://www.iii.org/insuranceindustryblog/nicb-top-5-states-for-hail-claims/" }]} />

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">
          County-level severe hail day records (since 2000)
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          A NOAA-records-based county analysis of &quot;severe hail days&quot; (any day with 1&quot;+ hail reported
          in the county) since 2000:
        </p>
        <StatTable
          headers={["County", "Metro", "Severe hail days since 2000"]}
          rows={[
            { cells: ["Potter County, TX", "Amarillo", "131"] },
            { cells: ["Tarrant County, TX", "Fort Worth / DFW", "126"] },
            { cells: ["Lubbock County, TX", "Lubbock", "~122"] },
          ]}
        />
        <SourceLine sources={[{ label: "NOAA-based county hail analysis, via AOL/regional news coverage", href: "https://www.aol.com/north-texas-counties-top-u-173902148.html" }]} />

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">
          Highest combined storm risk: Chicago
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          Cotality&apos;s (formerly CoreLogic) 2025 Severe Convective Storm Risk Report found the Chicago metro area
          carries the largest concentration of risk in the country across all three major convective-storm
          hazards — hail, tornado, and straight-line wind — combined:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          <li>Nearly 3 million homes at risk of hail damage</li>
          <li>Over 3 million homes at risk of tornado or straight-line wind damage</li>
          <li>$1.4 trillion in combined reconstruction cost value exposed</li>
        </ul>
        <SourceLine sources={[{ label: "Cotality press release", href: "https://www.cotality.com/press-releases/chicago-metro-area-has-highest-concentration-of-risk-for-severe-hail-winds-and-tornadoes-corelogic" }]} />

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">Costliest known hailstorm events</h2>
        <StatTable
          headers={["Event", "Insured losses", "Notes"]}
          rows={[
            { cells: ["May 8, 2017 — Denver, CO", "$2.3 billion", "Costliest catastrophe in Colorado history; 3rd-costliest hailstorm in U.S. history"] },
            { cells: ["June 2017 — Minneapolis, MN", "~$2.5 billion", "Pushed the Colorado storm to 3rd-costliest nationally"] },
            { cells: ["Oct. 2010 — Phoenix/Tucson, AZ area", "$2.81 billion", "Previously the 2nd-costliest U.S. hailstorm"] },
            { cells: ["April 28, 2021 — Tarrant County, TX", "~$500 million (statewide)", "32,000 claims filed statewide, most in Tarrant County"] },
            { cells: ["July 2024 — Hurricane Beryl, Houston, TX", "$2.5–4.5 billion (Moody's RMS estimate)", "Combined wind/hail/water damage; roofing a substantial share"] },
          ]}
        />
        <SourceLine
          sources={[
            { label: "AccuWeather / NICB (2017 Colorado storm)", href: "https://www.accuweather.com/en/severe-weather/hail-causes-costliest-catastrophe-in-colorado-history/1166453" },
            { label: "Insurance Journal (Hurricane Beryl)", href: "https://www.insurancejournal.com/news/southcentral/2024/07/19/784786.htm" },
          ]}
        />

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">Regional claim-cost benchmarks</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          <li>Minnesota&apos;s average hail insurance claim has climbed to roughly $30,000, nearly double what it was a decade ago, per the Insurance Federation of Minnesota.</li>
          <li>Wisconsin averages roughly 15 days per summer with hail 1.5&quot; or larger, per state severe-weather climatology.</li>
        </ul>
        <SourceLine
          sources={[
            { label: "Insurance Federation of Minnesota, via Owl Roofing", href: "https://owlroofing.com/blog/average-hail-claim-minnesota/" },
            { label: "Wisconsin State Climatology Office", href: "https://climatology.nelson.wisc.edu/wisconsin-severe-weather-climatology/" },
          ]}
        />

        <h2 className="mt-14 mb-3 text-2xl font-black tracking-tight sm:text-3xl">Methodology &amp; corrections</h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          Every figure on this page links directly to the primary source it came from — no number is presented
          without one. This page is updated as newer NICB, State Farm, Verisk, or Cotality reports are published.
          If you find an error or an outdated figure, we want to know —{" "}
          <Link href="/blog" className="text-[var(--rs-amber)] underline-offset-4 hover:underline">
            reach out via the blog
          </Link>{" "}
          and we&apos;ll correct it.
        </p>

        <div className="mt-14 rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6">
          <p className="text-lg font-bold">Working one of these markets?</p>
          <p className="mt-2 text-[var(--rs-paper)]/60">
            RoofScout.io scans a neighborhood by satellite and hands your team a ranked, priced lead list — built for
            exactly the high-hail metros in this data. Free to try, 3 scans included.
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
