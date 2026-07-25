import type { LeadStatus } from "@/lib/types";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";

const STYLES: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Routed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  Contacted: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  Quoted: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  Won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  Lost: "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
};

export default function StatusChip({ status, locale = "en" }: { status: LeadStatus; locale?: Locale }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {dictionaries[locale].status[status]}
    </span>
  );
}
