import type { Condition } from "@/lib/types";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";

export const CONDITION_COLORS: Record<string, string> = {
  Critical: "#d03b3b",
  Poor: "#ec835a",
  Fair: "#fab219",
  Good: "#0ca30c",
  Ungraded: "#94a3b8",
};

// Color never carries the meaning alone — the label text is always present.
// The numeric score is only shown when it's real (graded) — an ungraded
// roof's score field is a meaningless placeholder.
export default function ConditionBadge({
  condition,
  locale = "en",
}: {
  condition: Condition;
  locale?: Locale;
}) {
  const label = dictionaries[locale].condition[condition.label] ?? condition.label;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: CONDITION_COLORS[condition.label] ?? "#64748b" }}
        aria-hidden
      />
      {condition.graded ? `${label} · ${condition.score}` : dictionaries[locale].condition.Ungraded}
    </span>
  );
}
