import Link from "next/link";
import Logo from "@/components/Logo";
import LunchboxBadge from "@/components/LunchboxBadge";
import LocaleToggle from "@/components/LocaleToggle";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/lib/i18n/getLocale";
import { BLOG_POSTS } from "@/lib/blog/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical guides on finding roofing leads, canvassing, and spotting a neglected roof — from the team building RoofScout.io.",
  alternates: { canonical: "/blog" },
};

const SITE_URL = "https://roofscout.io";

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
  ],
};

export default async function BlogIndexPage() {
  const { locale, t } = await getDictionary();
  const posts = [...BLOG_POSTS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return (
    <div className="flex flex-1 flex-col bg-[var(--rs-ink)] text-[var(--rs-paper)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <nav>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
            <Logo />
            <span className="hidden sm:inline">RoofScout.io</span>
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-5">
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

      <section className="rs-grid mx-auto w-full max-w-5xl px-4 pt-12 pb-20">
        <div className="rs-fade-up font-mono text-xs tracking-widest text-[var(--rs-scan)]">FIELD NOTES</div>
        <h1
          className="rs-fade-up mt-3 text-5xl leading-[0.95] font-black tracking-tighter sm:text-7xl"
          style={{ animationDelay: "0.08s" }}
        >
          Blog
        </h1>
        <p className="rs-fade-up mt-5 max-w-xl text-lg text-[var(--rs-paper)]/60" style={{ animationDelay: "0.16s" }}>
          Practical guides for roofing sales teams — finding leads, canvassing smarter, and spotting a bad roof
          before you knock.
        </p>

        <Link
          href="/hail-damage-statistics"
          className="mt-10 flex items-center justify-between gap-3 rounded-2xl border border-[var(--rs-amber)]/40 bg-[var(--rs-amber)]/10 px-6 py-4 transition-colors hover:border-[var(--rs-amber)]/70"
        >
          <div>
            <div className="font-mono text-xs tracking-widest text-[var(--rs-amber)]">DATA</div>
            <div className="mt-1 text-lg font-bold">US Hail Damage Statistics (2026)</div>
            <p className="mt-1 text-sm text-[var(--rs-paper)]/60">
              Every major hail-claim figure we cite in this blog, sourced and linked in one reference page.
            </p>
          </div>
          <span className="shrink-0 text-2xl text-[var(--rs-amber)]">→</span>
        </Link>

        <div className="mt-8 space-y-4">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 60}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6 transition-colors hover:border-white/25"
              >
                <div className="font-mono text-xs tracking-widest text-[var(--rs-paper)]/40">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {post.readingMinutes} min read
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight group-hover:text-[var(--rs-amber)] sm:text-3xl">
                  {post.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[var(--rs-paper)]/60">{post.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

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
