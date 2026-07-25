import type { Condition } from "./types";

// A GRADED roof scores 70+ ("Good") when it looks new or well-maintained —
// see the scoring legend on the dashboard. RoofScout is a neglected-roof
// finder, so scans drop anything at or above this line rather than
// surfacing it as a lead.
export const NEGLECT_SCORE_THRESHOLD = 70;
export const HOT_SCORE_THRESHOLD = 55;

// Ungraded roofs (AI vision grading unavailable — no ANTHROPIC_API_KEY, or
// the image fetch failed) have no verified condition. We keep them as leads
// — the address/measurement data still has value for manual review — but we
// never claim they're neglected, and never let them count as "hot" or get
// filtered out as healthy, since neither claim has evidence behind it.
export function isNeglected(condition: Condition): boolean {
  return !condition.graded || condition.score < NEGLECT_SCORE_THRESHOLD;
}

export function isHot(condition: Condition): boolean {
  return condition.graded && condition.score < HOT_SCORE_THRESHOLD;
}

// Sort key for "worst first": graded roofs by score ascending, ungraded
// roofs pushed to the end (we don't know how urgent they are).
export function urgencyRank(condition: Condition): number {
  return condition.graded ? condition.score : 1000;
}
