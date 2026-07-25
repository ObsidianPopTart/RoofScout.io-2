import type { LeadStatus } from "@/lib/types";

const STYLES: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  Routed: "bg-indigo-100 text-indigo-800",
  Contacted: "bg-sky-100 text-sky-800",
  Quoted: "bg-violet-100 text-violet-800",
  Won: "bg-emerald-100 text-emerald-800",
  Lost: "bg-slate-200 text-slate-500",
};

export default function StatusChip({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  );
}
