import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllLeads } from "@/lib/store";
import { urgencyRank } from "@/lib/leadFilter";
import LeadsTable from "@/components/LeadsTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leads — RoofScout.io",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "poor", label: "Poor" },
  { key: "fair", label: "Fair" },
  { key: "ungraded", label: "Ungraded" },
] as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ cond?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { cond } = await searchParams;
  const activeFilter = FILTERS.some((f) => f.key === cond) ? (cond as string) : "all";

  const all = (await getAllLeads(session.user.orgId)).sort(
    (a, b) => urgencyRank(a.condition) - urgencyRank(b.condition)
  );
  const leads =
    activeFilter === "all"
      ? all
      : all.filter((l) => l.condition.label.toLowerCase() === activeFilter);

  const countFor = (key: string) =>
    key === "all" ? all.length : all.filter((l) => l.condition.label.toLowerCase() === key).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">Every scanned roof, worst condition first.</p>
        </div>
        <Link
          href="/app/scan"
          className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          Run a new scan
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/app/leads" : `/app/leads?cond=${f.key}`}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
              activeFilter === f.key
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            {f.label} ({countFor(f.key)})
          </Link>
        ))}
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
