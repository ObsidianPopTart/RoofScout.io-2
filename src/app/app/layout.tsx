import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import HelpButton from "@/components/HelpButton";
import OnboardingTour from "@/components/OnboardingTour";
import { getDictionary } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  robots: { index: false, follow: false }, // internal tool — real per-org data, never indexed
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: src/proxy.ts already gates /app/:path* by redirecting
  // unauthenticated visits to /login, but every page re-checks the session
  // itself too — a proxy matcher change should never be the only thing
  // standing between an unauthenticated request and real customer data.
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { locale, t } = await getDictionary();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardedAt: true },
  });

  return (
    <div className="flex flex-1 flex-col">
      <nav className="bg-slate-900 text-white">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-8 px-4">
          <Link href="/app" className="flex items-center gap-2 text-lg font-semibold">
            <Logo />
            RoofScout.io
          </Link>
          <div className="flex gap-6 text-sm text-slate-300">
            <Link href="/app" className="hover:text-white">
              {t.appNav.dashboard}
            </Link>
            <Link href="/app/scan" className="hover:text-white">
              {t.appNav.newScan}
            </Link>
            <Link href="/app/leads" className="hover:text-white">
              {t.appNav.leads}
            </Link>
            <Link href="/app/billing" className="hover:text-white">
              {t.appNav.billing}
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm text-slate-300">
            <LocaleToggle
              locale={locale}
              className="rounded-md border border-slate-700 px-2 py-1 text-xs font-semibold hover:border-slate-500"
            />
            <ThemeToggle className="hover:text-white" />
            <HelpButton className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 text-xs font-semibold hover:border-slate-500" />
            <span>{session.user.orgName}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="hover:text-white">
                {t.appNav.signOut}
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">{children}</main>
      <OnboardingTour
        initialOpen={!user?.onboardedAt}
        steps={t.onboarding.steps}
        labels={{
          skip: t.onboarding.skip,
          back: t.onboarding.back,
          next: t.onboarding.next,
          done: t.onboarding.done,
        }}
      />
    </div>
  );
}
