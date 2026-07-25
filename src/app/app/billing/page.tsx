import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS, normalizePlanTier } from "@/lib/usage";
import { UpgradeButton, ManageBillingButton } from "@/components/BillingActions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Billing — RoofScout" };

const PLAN_COPY = {
  free: { label: "Free", price: "$0", detail: "3 scans, once" },
  pro: { label: "Pro", price: "$49/mo", detail: "50 scans/month" },
  apex: { label: "Apex", price: "$149/mo", detail: "Unlimited scans" },
} as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { checkout } = await searchParams;
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: session.user.orgId } });
  const plan = normalizePlanTier(org.planTier);
  const limits = PLAN_LIMITS[plan];

  let usageLine = "Unlimited scans";
  if (limits.lifetimeScans !== null) {
    const used = await prisma.scanRecord.count({ where: { orgId: org.id } });
    usageLine = `${used} of ${limits.lifetimeScans} free scans used`;
  } else if (limits.scansPerMonth !== null) {
    usageLine = `${org.scanCountThisMonth} of ${limits.scansPerMonth} scans used this month`;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your RoofScout plan.</p>

      {checkout === "success" && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Subscription updated — thanks!
        </p>
      )}
      {checkout === "cancelled" && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Checkout cancelled — no changes were made.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Current plan</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">
              {PLAN_COPY[plan].label} · {PLAN_COPY[plan].price}
            </div>
            <div className="mt-1 text-sm text-slate-500">{usageLine}</div>
          </div>
          {org.stripeCustomerId && <ManageBillingButton />}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(["pro", "apex"] as const)
          .filter((p) => p !== plan)
          .map((p) => (
            <div key={p} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-slate-900">{PLAN_COPY[p].label}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{PLAN_COPY[p].price}</div>
              <div className="mt-1 text-sm text-slate-500">{PLAN_COPY[p].detail}</div>
              <div className="mt-4">
                <UpgradeButton plan={p} label={`Upgrade to ${PLAN_COPY[p].label}`} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
