import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import { getDictionary } from "@/lib/i18n/getLocale";

export default async function MarketingHomePage() {
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col bg-slate-950 text-white">
      <nav className="relative z-10">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Logo />
            RoofScout
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/pricing" className="text-slate-300 hover:text-white">
              {t.nav.pricing}
            </Link>
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

      {/* Hero — oversized display type on a full-bleed dark field */}
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 pt-8 pb-20 lg:grid-cols-[1.2fr_1fr] lg:pt-16 lg:pb-28">
        <div>
          <h1 className="text-6xl leading-[0.95] font-black tracking-tighter sm:text-7xl lg:text-[5.5rem]">
            {t.home.headline}
          </h1>
          <p className="mt-7 max-w-md text-lg text-slate-400">{t.home.sub}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-amber-500 px-8 py-4 text-base font-bold text-slate-950 hover:bg-amber-400"
            >
              {t.home.startFree}
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-slate-700 px-8 py-4 text-base font-bold text-white hover:border-slate-500"
            >
              {t.home.login}
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <Image
            src="/images/hero-neighborhood-aerial.jpg"
            alt="Aerial satellite view of a suburban neighborhood with many rooftops"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </section>

      {/* Feature — full-bleed amber block */}
      <section className="bg-amber-500 text-slate-950">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl lg:order-2">
            <Image
              src="/images/roof-tiles-closeup.jpg"
              alt="Close-up of weathered roof tiles showing wear and moss"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div>
            <h2 className="text-4xl leading-[0.95] font-black tracking-tighter sm:text-6xl">
              {t.home.featureHeadline}
            </h2>
            <p className="mt-6 max-w-md text-lg text-slate-800">{t.home.featureBody}</p>
          </div>
        </div>
      </section>

      {/* Statement — bold pull-quote with arrow accent */}
      <section className="bg-white text-slate-950">
        <div className="mx-auto flex w-full max-w-6xl items-start gap-6 px-4 py-20 lg:py-28">
          <span className="mt-2 shrink-0 text-4xl text-amber-500 sm:text-5xl" aria-hidden>
            →
          </span>
          <p className="text-3xl leading-[1.05] font-black tracking-tight sm:text-5xl lg:text-6xl">
            {t.home.statement}
          </p>
        </div>
      </section>

      {/* Final CTA — dark block bookending the hero */}
      <section className="bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-20 lg:py-28">
          <h2 className="text-4xl leading-[0.95] font-black tracking-tighter sm:text-6xl">
            {t.home.finalCta}
          </h2>
          <p className="text-lg text-slate-400">{t.home.finalCtaSub}</p>
          <Link
            href="/signup"
            className="mt-2 rounded-full bg-amber-500 px-8 py-4 text-base font-bold text-slate-950 hover:bg-amber-400"
          >
            {t.home.startFree}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        RoofScout ·{" "}
        <Link href="/privacy" className="underline hover:text-slate-300">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
