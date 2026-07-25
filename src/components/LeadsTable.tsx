"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Lead } from "@/lib/types";
import { defaultQuoteForLead } from "@/lib/quote";
import { moneyCompact, number } from "@/lib/format";
import ConditionBadge from "@/components/ConditionBadge";
import StatusChip from "@/components/StatusChip";

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [routing, setRouting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const allSelected = leads.length > 0 && selected.size === leads.length;
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(leads.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exportUrl(ids?: string[]) {
    return ids && ids.length > 0 ? `/api/leads/export?ids=${ids.join(",")}` : "/api/leads/export";
  }

  async function routeToMarketing() {
    if (selectedIds.length === 0) return;
    setRouting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/leads/route-to-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as { updated: number };
      setNotice(`Routed ${data.updated} lead${data.updated === 1 ? "" : "s"} to marketing.`);
      setSelected(new Set());
      router.refresh();
    } catch {
      setNotice("Couldn't route those leads — try again.");
    } finally {
      setRouting(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {selected.size > 0 ? (
            <>
              <span className="text-sm font-medium text-slate-700">{selected.size} selected</span>
              <a
                href={exportUrl(selectedIds)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
              >
                Export CSV
              </a>
              <button
                onClick={routeToMarketing}
                disabled={routing}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-400"
              >
                {routing ? "Routing…" : "Route to marketing team"}
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                Clear
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Select leads to export a CSV or hand them off to a marketing team for an outbound
              campaign.
            </p>
          )}
        </div>
        <a
          href={exportUrl()}
          className="text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          Export all {leads.length} as CSV →
        </a>
      </div>

      {notice && (
        <p className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
          {notice}
        </p>
      )}

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all leads"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-2.5 font-medium">Address</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium">Condition</th>
                <th className="px-4 py-2.5 font-medium">Roof</th>
                <th className="px-4 py-2.5 font-medium">Age</th>
                <th className="px-4 py-2.5 font-medium">Est. quote</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leads.map((lead) => {
                const q = defaultQuoteForLead(lead);
                return (
                  <tr key={lead.id} className={selected.has(lead.id) ? "bg-amber-50/60 dark:bg-amber-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(lead.id)}
                        onChange={() => toggleOne(lead.id)}
                        aria-label={`Select ${lead.address}`}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/app/leads/${lead.id}`} className="font-medium text-slate-800 hover:text-amber-700 dark:text-slate-100 dark:hover:text-amber-400">
                        {lead.address}
                      </Link>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {lead.city ? `${lead.city}, ${lead.state} ${lead.zip}` : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{lead.owner?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <ConditionBadge condition={lead.condition} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{number(lead.roof.areaSqFt)} sq ft</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {lead.roof.estAgeYears > 0 ? `~${lead.roof.estAgeYears} yrs` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {moneyCompact(q.low)}–{moneyCompact(q.high)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/app/leads/${lead.id}`}
                        className="text-sm font-medium text-amber-700 hover:text-amber-800"
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                    No leads match this filter yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
