import type { Condition } from "@/lib/types";

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
export default function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 whitespace-nowrap">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: CONDITION_COLORS[condition.label] ?? "#64748b" }}
        aria-hidden
      />
      {condition.graded ? `${condition.label} · ${condition.score}` : "Ungraded"}
    </span>
  );
}
