import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import { getDictionary } from "@/lib/i18n/getLocale";

export default async function MarketingHomePage() {
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
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              {t.nav.pricing}
            </Link>
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

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t.home.headline}</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">{t.home.sub}</p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400"
            >
              {t.home.startFree}
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-900 hover:border-slate-400 dark:border-slate-700 dark:text-white dark:hover:border-slate-500"
            >
              {t.home.login}
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
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

      <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl shadow-lg lg:order-2">
            <Image
              src="/images/roof-tiles-closeup.jpg"
              alt="Close-up of weathered roof tiles showing wear and moss"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.featureHeadline}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{t.home.featureBody}</p>
          </div>
        </div>
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
