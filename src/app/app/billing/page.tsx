import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS, normalizePlanTier } from "@/lib/usage";
import { UpgradeButton, ManageBillingButton } from "@/components/BillingActions";
import { getDictionary } from "@/lib/i18n/getLocale";
import { tf } from "@/lib/i18n/format";

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
          </div>
          {org.stripeCustomerId && <ManageBillingButton locale={locale} />}
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
    </div>
  );
}
