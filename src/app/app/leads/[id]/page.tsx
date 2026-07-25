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

export const dynamic = "force-dynamic";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
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

  const { id } = await params;
  // getLead filters by orgId in the query itself — a lead id from another
  // org resolves to "not found" here, not a leaked record.
  const lead = await getLead(session.user.orgId, id);
  if (!lead) notFound();

  const quoteDefaults = defaultQuoteInputs(lead);
  const cityLine = lead.city ? `${lead.city}, ${lead.state} ${lead.zip}` : "Address pending verification";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link href="/app/leads" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← All leads
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{lead.address}</h1>
        <ConditionBadge condition={lead.condition} />
        <StatusChip status={lead.status} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {cityLine} · found by {lead.scanId} · lead {lead.id}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-5">
          {lead.imageUrl ? (
            <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- proxied dynamic imagery */}
              <img
                src={lead.imageUrl}
                alt={`Satellite view of ${lead.address}`}
                className="block w-full"
              />
              <figcaption className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
                Satellite imagery via Google Maps · roof measurements via Google Solar API
              </figcaption>
            </figure>
          ) : (
            <RoofAerial lead={lead} />
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">AI condition read</h2>
            <p className="mt-1 text-sm text-slate-600">{lead.condition.summary}</p>
            {lead.condition.issues.length > 0 && (
              <ul className="mt-3 space-y-2">
                {lead.condition.issues.map((issue) => (
                  <li key={issue} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Property &amp; owner</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <Fact label="Roof material" value={lead.roof.material} />
              <Fact
                label="Est. roof age"
                value={lead.roof.estAgeYears > 0 ? `~${lead.roof.estAgeYears} years` : "Unknown"}
              />
              <Fact label="Pitch" value={lead.roof.pitch} />
              <Fact label="Roof area" value={`≈${number(lead.roof.areaSqFt)} sq ft`} />
              <Fact label="Roof segments" value={`${lead.roof.segments}`} />
              {lead.owner && (
                <>
                  <Fact label="Owner" value={lead.owner.name} />
                  <Fact label="Phone" value={lead.owner.phone} />
                  <Fact label="Email" value={lead.owner.email} />
                  <Fact label="Years owned" value={`${lead.owner.yearsOwned}`} />
                  <Fact label="Assessed value" value={money(lead.owner.assessedValue)} />
                </>
              )}
            </dl>
            {!lead.owner && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Owner records arrive with the county parcel-data connection (Regrid / ATTOM). Until
                then, look up this address on the county assessor site before the visit.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-amber-900">Sales intel</h2>
            <p className="mt-0.5 text-xs text-amber-700">
              Talking points built from this profile — the doorstep cheat sheet.
            </p>
            <ol className="mt-3 space-y-2.5">
              {lead.salesAngles.map((angle, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-amber-950">
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
          />
        </div>
      </div>
    </div>
  );
}
