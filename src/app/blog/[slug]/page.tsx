import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/lib/i18n/getLocale";
import { BLOG_POSTS, getBlogPost, type BlogBlock } from "@/lib/blog/posts";
import type { Metadata } from "next";

const SITE_URL = "https://roof-scout.org";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      url: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

function renderBlock(block: BlogBlock, key: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={key} className="mt-10 mb-3 text-2xl font-black tracking-tight sm:text-3xl">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={key} className="mt-8 mb-2 text-xl font-bold tracking-tight">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={key} className="mt-4 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={key} className="mt-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key} className="mt-4 list-decimal space-y-2 pl-6 text-lg leading-relaxed text-[var(--rs-paper)]/75">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote
          key={key}
          className="mt-6 border-l-2 border-[var(--rs-scan)] pl-5 text-lg text-[var(--rs-paper)]/60 italic"
        >
          {block.text}
        </blockquote>
      );
    case "link":
      return (
        <p key={key} className="mt-6">
          <Link
            href={block.href}
            className="text-lg font-semibold text-[var(--rs-amber)] underline-offset-4 hover:underline"
          >
            {block.text}
          </Link>
        </p>
      );
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const { locale, t } = await getDictionary();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "RoofScout" },
    publisher: { "@type": "Organization", name: "RoofScout" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  // Breadcrumb rich results in Google search — Home > Blog > this post.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  // A genuine step-by-step HowTo, not forced onto every post — only the
  // canvassing checklist is actually structured as sequential steps.
  const howToJsonLd = post.howToSteps
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: post.title,
        description: post.description,
        step: post.howToSteps.map((s) => ({ "@type": "HowToStep", name: s.name, text: s.text })),
      }
    : null;

  return (
    <div className="flex flex-1 flex-col bg-[var(--rs-ink)] text-[var(--rs-paper)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {howToJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      )}
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
            <ThemeToggle className="hidden text-[var(--rs-paper)]/60 hover:text-[var(--rs-paper)] sm:inline-block" />
          </div>
        </div>
      </nav>

      <article className="rs-grid mx-auto w-full max-w-3xl px-4 pt-12 pb-24">
        <Reveal>
          <Link href="/blog" className="font-mono text-xs tracking-widest text-[var(--rs-scan)]">
            ← FIELD NOTES
          </Link>
          <div className="mt-4 font-mono text-xs tracking-widest text-[var(--rs-paper)]/40">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {post.readingMinutes} min read
          </div>
          <h1 className="mt-3 text-4xl leading-[0.98] font-black tracking-tight sm:text-5xl">{post.title}</h1>
        </Reveal>

        <div className="mt-2">{post.body.map((block, i) => renderBlock(block, i))}</div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6">
          <p className="text-lg font-bold">Ready to stop guessing which roofs need work?</p>
          <p className="mt-2 text-[var(--rs-paper)]/60">
            RoofScout scans a neighborhood by satellite and hands your team a ranked, priced lead list. Free to try,
            3 scans included.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded-full bg-[var(--rs-amber)] px-6 py-3 font-bold text-[#1a1206] transition-transform hover:-translate-y-0.5"
          >
            Start Free
          </Link>
        </div>
      </article>

      <footer className="mt-auto border-t border-white/10 py-6 text-center font-mono text-xs text-[var(--rs-paper)]/40">
        RoofScout ·{" "}
        <Link href="/privacy" className="underline hover:text-[var(--rs-paper)]/70">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
