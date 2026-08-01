import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS, normalizePlanTier } from "@/lib/usage";
import { getReferralStats } from "@/lib/referral";
import { UpgradeButton, ManageBillingButton, BuyScanPackButton, CopyReferralLink } from "@/components/BillingActions";
import TerritoryManager from "@/components/TerritoryManager";
import { getDictionary } from "@/lib/i18n/getLocale";
import { tf } from "@/lib/i18n/format";
import { listTerritoryClaims } from "@/lib/territory";

export const dynamic = "force-dynamic";

export const metadata = { title: "Billing — RoofScout" };

const PLAN_PRICE = { free: "$0", pro: "$49/mo", apex: "$149/mo" } as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { locale, t } = await getDictionary();
  const d = t.billingPage;

  const { checkout } = await searchParams;
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: session.user.orgId } });
  const plan = normalizePlanTier(org.planTier);
  const limits = PLAN_LIMITS[plan];

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "roof-scout.org";
  const proto = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const referral = await getReferralStats(org.id, `${proto}://${host}`);

  const territoryClaims =
    plan === "apex"
      ? (await listTerritoryClaims(org.id)).map((c) => ({ ...c, claimedAt: c.claimedAt.toISOString() }))
      : [];

  let usageLine: string = d.unlimitedScans;
  if (limits.lifetimeScans !== null) {
    const used = await prisma.scanRecord.count({ where: { orgId: org.id } });
    usageLine = tf(d.scansUsedFree, { used, limit: limits.lifetimeScans });
  } else if (limits.scansPerMonth !== null) {
    usageLine = tf(d.scansUsedMonth, { used: org.scanCountThisMonth, limit: limits.scansPerMonth });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{d.title}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d.subtitle}</p>

      {checkout === "success" && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          {d.checkoutSuccess}
        </p>
      )}
      {checkout === "cancelled" && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {d.checkoutCancelled}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{d.currentPlan}</div>
            <div className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              {t.pricing[plan].name} · {PLAN_PRICE[plan]}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{usageLine}</div>
            {org.scanCreditBalance > 0 && (
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {tf(d.scanCreditBalance, { count: org.scanCreditBalance })}
              </div>
            )}
          </div>
          {org.stripeCustomerId && <ManageBillingButton locale={locale} />}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-lg font-semibold text-slate-900 dark:text-white">{d.scanPackTitle}</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d.scanPackBody}</p>
        <div className="mt-4">
          <BuyScanPackButton locale={locale} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-lg font-semibold text-slate-900 dark:text-white">{d.territoryTitle}</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {plan === "apex" ? d.territoryBodyApex : d.territoryBodyLocked}
        </p>
        <div className="mt-4">
          {plan === "apex" ? (
            <TerritoryManager initialClaims={territoryClaims} locale={locale} />
          ) : (
            <UpgradeButton plan="apex" label={tf(d.upgradeTo, { plan: t.pricing.apex.name })} locale={locale} />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(["pro", "apex"] as const)
          .filter((p) => p !== plan)
          .map((p) => (
            <div key={p} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{t.pricing[p].name}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{PLAN_PRICE[p]}</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.pricing[p].detail}</div>
              <div className="mt-4">
                <UpgradeButton plan={p} label={tf(d.upgradeTo, { plan: t.pricing[p].name })} locale={locale} />
              </div>
            </div>
          ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-lg font-semibold text-slate-900 dark:text-white">{d.referralTitle}</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d.referralBody}</p>
        <div className="mt-4">
          <CopyReferralLink link={referral.link} locale={locale} />
        </div>
        <div className="mt-3 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>{tf(d.referralPending, { count: referral.pending })}</span>
          <span>{tf(d.referralConverted, { count: referral.converted })}</span>
        </div>
      </div>
    </div>
  );
}
