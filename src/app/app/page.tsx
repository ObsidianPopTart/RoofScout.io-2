import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllLeads, getAllScans } from "@/lib/store";
import { defaultQuoteForLead } from "@/lib/quote";
import { moneyCompact, number } from "@/lib/format";
import ConditionBadge, { CONDITION_COLORS } from "@/components/ConditionBadge";
import StatusChip from "@/components/StatusChip";
import { isHot, urgencyRank } from "@/lib/leadFilter";
import { getDictionary } from "@/lib/i18n/getLocale";
import { tf } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = session.user.orgId;
  const { locale, t } = await getDictionary();
  const d = t.dashboard;

  const [leads, scans] = await Promise.all([getAllLeads(orgId), getAllScans(orgId)]);
  const active = leads.filter((l) => l.status !== "Won" && l.status !== "Lost");
  const hot = leads.filter((l) => isHot(l.condition));
  const pipeline = active.reduce((sum, l) => sum + defaultQuoteForLead(l).mid, 0);
  const worst = [...leads].sort((a, b) => urgencyRank(a.condition) - urgencyRank(b.condition)).slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{d.title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d.subtitle}</p>
        </div>
        <Link
          href="/app/scan"
          className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          {d.runNewScan}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={d.totalLeads} value={number(leads.length)} sub={`${active.length} ${d.activeInPipeline}`} />
        <StatTile label={d.hotLeads} value={number(hot.length)} sub={d.hotLeadsSub} />
        <StatTile label={d.estPipeline} value={moneyCompact(pipeline)} sub={d.estPipelineSub} />
        <StatTile label={d.scansRun} value={number(scans.length)} sub={`${d.latest}: ${scans.at(-1)?.label ?? "—"}`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{d.worstRoofsFirst}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{d.worstRoofsSub}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <th className="px-4 py-2 font-medium">{d.colAddress}</th>
                  <th className="px-4 py-2 font-medium">{d.colCondition}</th>
                  <th className="px-4 py-2 font-medium">{d.colRoof}</th>
                  <th className="px-4 py-2 font-medium">{d.colQuote}</th>
                  <th className="px-4 py-2 font-medium">{d.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {worst.map((lead) => {
                  const q = defaultQuoteForLead(lead);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-2.5">
                        <Link href={`/app/leads/${lead.id}`} className="font-medium text-slate-800 hover:text-amber-700 dark:text-slate-100 dark:hover:text-amber-400">
                          {lead.address}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <ConditionBadge condition={lead.condition} locale={locale} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{number(lead.roof.areaSqFt)} sq ft</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                        {moneyCompact(q.low)}–{moneyCompact(q.high)}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusChip status={lead.status} locale={locale} />
                      </td>
                    </tr>
                  );
                })}
                {worst.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                      {d.noLeadsYet}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
            <Link href="/app/leads" className="text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
              {tf(d.viewAllLeads, { count: leads.length })}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{d.howScoringWorks}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d.howScoringBody}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {(
                [
                  ["Critical", d.criticalDesc],
                  ["Poor", d.poorDesc],
                  ["Fair", d.fairDesc],
                ] as const
              ).map(([label, desc]) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: CONDITION_COLORS[label] }} aria-hidden />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{t.condition[label]}</span>
                  <span className="text-slate-500 dark:text-slate-400">{desc}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ background: CONDITION_COLORS.Good }} aria-hidden />
                <span className="font-medium">{t.condition.Good}</span>
                <span>{d.goodDesc}</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ background: CONDITION_COLORS.Ungraded }} aria-hidden />
                <span className="font-medium">{t.condition.Ungraded}</span>
                <span>{d.ungradedDesc}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{d.theWorkflow}</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-slate-600 dark:text-slate-300">
              <li>{d.workflowStep1}</li>
              <li>{d.workflowStep2}</li>
              <li>{d.workflowStep3}</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
