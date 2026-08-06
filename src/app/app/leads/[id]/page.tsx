import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLead } from "@/lib/store";
import { defaultQuoteInputs } from "@/lib/quote";
import { money, number } from "@/lib/format";
import ConditionBadge from "@/components/ConditionBadge";
import StatusChip from "@/components/StatusChip";
import RoofAerial from "@/components/RoofAerial";
import QuoteCalculator from "@/components/QuoteCalculator";
import { getDictionary } from "@/lib/i18n/getLocale";
import { tf } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}

export default async function LeadProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { locale, t } = await getDictionary();
  const d = t.leadDetail;

  const { id } = await params;
  // getLead filters by orgId in the query itself — a lead id from another
  // org resolves to "not found" here, not a leaked record.
  const lead = await getLead(session.user.orgId, id);
  if (!lead) notFound();

  const quoteDefaults = defaultQuoteInputs(lead);
  const cityLine = lead.city ? `${lead.city}, ${lead.state} ${lead.zip}` : d.addressPending;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link
          href={`/app/scan?scanId=${lead.scanId}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {d.backToScan}
        </Link>
        <Link href="/app/leads" className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          {d.allLeads}
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{lead.address}</h1>
        <ConditionBadge condition={lead.condition} locale={locale} />
        <StatusChip status={lead.status} locale={locale} />
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {cityLine} · {tf(d.foundBy, { scanId: lead.scanId, leadId: lead.id })}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-5">
          {lead.imageUrl ? (
            <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element -- proxied dynamic imagery */}
              <img
                src={lead.imageUrl}
                alt={`Satellite view of ${lead.address}`}
                className="block w-full"
              />
              <figcaption className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {d.satelliteCaption}
              </figcaption>
            </figure>
          ) : (
            <RoofAerial lead={lead} />
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{d.aiConditionRead}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{lead.condition.summary}</p>
            {lead.condition.issues.length > 0 && (
              <ul className="mt-3 space-y-2">
                {lead.condition.issues.map((issue) => (
                  <li key={issue} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{d.propertyOwner}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <Fact label={d.roofMaterial} value={lead.roof.material} />
              <Fact
                label={d.estRoofAge}
                value={lead.roof.estAgeYears > 0 ? `~${lead.roof.estAgeYears} ${d.years}` : d.unknown}
              />
              <Fact label={d.pitch} value={lead.roof.pitch} />
              <Fact label={d.roofArea} value={`≈${number(lead.roof.areaSqFt)} sq ft`} />
              <Fact label={d.roofSegments} value={`${lead.roof.segments}`} />
              {lead.owner && (
                <>
                  <Fact label={d.owner} value={lead.owner.name} />
                  <Fact label={d.phone} value={lead.owner.phone} />
                  <Fact label={d.email} value={lead.owner.email} />
                  <Fact label={d.yearsOwned} value={`${lead.owner.yearsOwned}`} />
                  <Fact label={d.assessedValue} value={money(lead.owner.assessedValue)} />
                </>
              )}
            </dl>
            {!lead.owner && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {d.ownerRecordsNote}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900 dark:bg-amber-950">
            <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">{d.salesIntel}</h2>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">{d.salesIntelSub}</p>
            <ol className="mt-3 space-y-2.5">
              {lead.salesAngles.map((angle, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-amber-950 dark:text-amber-100">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  {angle}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <QuoteCalculator
            initialArea={quoteDefaults.areaSqFt}
            initialPitch={quoteDefaults.pitch}
            initialMaterialId={quoteDefaults.materialId}
            initialComplexityId={quoteDefaults.complexityId}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
