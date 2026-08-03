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

const PLAN_META = {
  free: { price: "$0" },
  pro: { price: "$49", period: "/mo" },
  apex: { price: "$149", period: "/mo" },
} as const;

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
    <div className="rs-grid bg-[var(--rs-ink)] text-[var(--rs-paper)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="font-mono text-xs tracking-widest text-[var(--rs-scan)]">ACCOUNT</div>
        <h1 className="mt-3 text-4xl leading-[0.98] font-black tracking-tighter sm:text-5xl">{d.title}</h1>
        <p className="mt-3 max-w-xl text-lg text-[var(--rs-paper)]/60">{d.subtitle}</p>

        {checkout === "success" && (
          <p className="mt-6 rounded-lg border border-emerald-900 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
            {d.checkoutSuccess}
          </p>
        )}
        {checkout === "cancelled" && (
          <p className="mt-6 rounded-lg border border-white/10 bg-[var(--rs-ink-2)] px-3 py-2 text-sm text-[var(--rs-paper)]/70">
            {d.checkoutCancelled}
          </p>
        )}

        {/* Current plan — the same amber "featured tile" treatment as /pricing */}
        <div className="mt-10 rounded-2xl bg-[var(--rs-amber)] p-6 text-[#1a1206]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs tracking-wide text-[#1a1206]/60">{d.currentPlan}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight">{t.pricing[plan].name}</span>
                <span className="text-lg font-bold text-[#1a1206]/70">
                  {PLAN_META[plan].price}
                  {plan !== "free" ? PLAN_META[plan].period : ""}
                </span>
              </div>
              <div className="mt-2 text-sm font-medium text-[#1a1206]/80">{usageLine}</div>
              {org.scanCreditBalance > 0 && (
                <div className="mt-1 text-sm font-medium text-[#1a1206]/80">
                  {tf(d.scanCreditBalance, { count: org.scanCreditBalance })}
                </div>
              )}
            </div>
            {org.stripeCustomerId && <ManageBillingButton locale={locale} />}
          </div>
        </div>

        {/* Full plan lineup, same tile format as /pricing */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {(["free", "pro", "apex"] as const).map((p, i) => {
            const isCurrent = p === plan;
            const meta = PLAN_META[p];
            const copy = t.pricing[p];
            return (
              <div
                key={p}
                className={`rounded-2xl p-6 ${
                  isCurrent ? "border-2 border-[var(--rs-amber)] bg-[var(--rs-ink-2)]" : "border border-white/10 bg-[var(--rs-ink-2)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg font-bold">{copy.name}</div>
                  {isCurrent && (
                    <span className="rounded-full bg-[var(--rs-amber)]/15 px-2 py-0.5 font-mono text-[10px] tracking-wide text-[var(--rs-amber)]">
                      {d.currentPlan}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight">{meta.price}</span>
                  {"period" in meta && <span className="text-[var(--rs-paper)]/50">{meta.period}</span>}
                </div>
                <div className="mt-1 text-sm text-[var(--rs-paper)]/50">{copy.detail}</div>
                <ul className="mt-4 space-y-1.5 text-sm text-[var(--rs-paper)]/70">
                  {copy.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-[var(--rs-scan)]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <div className="rounded-full border border-white/15 px-4 py-2.5 text-center text-sm font-bold text-[var(--rs-paper)]/50">
                      {d.currentPlan}
                    </div>
                  ) : p === "free" ? null : (
                    <UpgradeButton
                      plan={p as "pro" | "apex"}
                      label={tf(d.upgradeTo, { plan: copy.name })}
                      locale={locale}
                      highlight={i === 1}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scan pack */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6">
          <div className="text-lg font-bold">{d.scanPackTitle}</div>
          <p className="mt-1 text-[var(--rs-paper)]/60">{d.scanPackBody}</p>
          <div className="mt-4">
            <BuyScanPackButton locale={locale} />
          </div>
        </div>

        {/* Territory exclusivity */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6">
          <div className="text-lg font-bold">{d.territoryTitle}</div>
          <p className="mt-1 text-[var(--rs-paper)]/60">{plan === "apex" ? d.territoryBodyApex : d.territoryBodyLocked}</p>
          <div className="mt-4">
            {plan === "apex" ? (
              <TerritoryManager initialClaims={territoryClaims} locale={locale} />
            ) : (
              <UpgradeButton plan="apex" label={tf(d.upgradeTo, { plan: t.pricing.apex.name })} locale={locale} />
            )}
          </div>
        </div>

        {/* Referral program */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[var(--rs-ink-2)] p-6">
          <div className="text-lg font-bold">{d.referralTitle}</div>
          <p className="mt-1 text-[var(--rs-paper)]/60">{d.referralBody}</p>
          <div className="mt-4">
            <CopyReferralLink link={referral.link} locale={locale} />
          </div>
          <div className="mt-3 flex gap-4 text-xs text-[var(--rs-paper)]/50">
            <span>{tf(d.referralPending, { count: referral.pending })}</span>
            <span>{tf(d.referralConverted, { count: referral.converted })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
