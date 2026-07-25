import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllLeads, getAllScans } from "@/lib/store";
import { defaultQuoteForLead } from "@/lib/quote";
import { moneyCompact, number } from "@/lib/format";
import ConditionBadge, { CONDITION_COLORS } from "@/components/ConditionBadge";
import StatusChip from "@/components/StatusChip";
import { isHot, urgencyRank } from "@/lib/leadFilter";

export const dynamic = "force-dynamic";

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = session.user.orgId;

  const [leads, scans] = await Promise.all([getAllLeads(orgId), getAllScans(orgId)]);
  const active = leads.filter((l) => l.status !== "Won" && l.status !== "Lost");
  const hot = leads.filter((l) => isHot(l.condition));
  const pipeline = active.reduce((sum, l) => sum + defaultQuoteForLead(l).mid, 0);
  const worst = [...leads].sort((a, b) => urgencyRank(a.condition) - urgencyRank(b.condition)).slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every neglected roof in your scan areas, ranked and priced.
          </p>
        </div>
        <Link
          href="/app/scan"
          className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          Run a new scan
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total leads" value={number(leads.length)} sub={`${active.length} active in pipeline`} />
        <StatTile label="Hot leads" value={number(hot.length)} sub="roofs scoring below 55" />
        <StatTile label="Est. pipeline" value={moneyCompact(pipeline)} sub="mid-range quotes, active leads" />
        <StatTile label="Scans run" value={number(scans.length)} sub={`latest: ${scans.at(-1)?.label ?? "—"}`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Worst roofs first</h2>
            <p className="text-xs text-slate-500">Your highest-urgency door knocks</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2 font-medium">Address</th>
                  <th className="px-4 py-2 font-medium">Condition</th>
                  <th className="px-4 py-2 font-medium">Roof</th>
                  <th className="px-4 py-2 font-medium">Est. quote</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {worst.map((lead) => {
                  const q = defaultQuoteForLead(lead);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <Link href={`/app/leads/${lead.id}`} className="font-medium text-slate-800 hover:text-amber-700">
                          {lead.address}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <ConditionBadge condition={lead.condition} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{number(lead.roof.areaSqFt)} sq ft</td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {moneyCompact(q.low)}–{moneyCompact(q.high)}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusChip status={lead.status} />
                      </td>
                    </tr>
                  );
                })}
                {worst.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      No leads yet — run your first scan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link href="/app/leads" className="text-sm font-medium text-amber-700 hover:text-amber-800">
              View all {leads.length} leads →
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">How scoring works</h2>
            <p className="mt-1 text-xs text-slate-500">
              The AI grades each rooftop 0–100 from a close-up satellite photo. Lower means more
              neglected — roofs scoring 70+ (new or well-maintained) never become leads.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {(
                [
                  ["Critical", "below 40 — visible failure"],
                  ["Poor", "40–54 — replace soon"],
                  ["Fair", "55–69 — early neglect"],
                ] as const
              ).map(([label, desc]) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: CONDITION_COLORS[label] }} aria-hidden />
                  <span className="font-medium text-slate-700">{label}</span>
                  <span className="text-slate-500">{desc}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: CONDITION_COLORS.Good }} aria-hidden />
                <span className="font-medium">Good</span>
                <span>70+ — filtered out, not shown as a lead</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: CONDITION_COLORS.Ungraded }} aria-hidden />
                <span className="font-medium">Ungraded</span>
                <span>no ANTHROPIC_API_KEY — kept as a lead, condition unverified</span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">The workflow</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-slate-600">
              <li>Scan a neighborhood from the map</li>
              <li>Open the worst-scoring profiles</li>
              <li>Bring the aerial view + quote to the door</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
