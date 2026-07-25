import type { Condition, ConditionLabel, LeadDraft, ScanBounds } from "./types";
import { MATERIALS } from "./quote";

// Deterministic PRNG so seeded demo data is stable across restarts.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Linda", "Michael", "Patricia", "David", "Jennifer",
  "William", "Elizabeth", "Richard", "Barbara", "Thomas", "Susan", "Carol", "Mark",
  "Sandra", "Paul", "Ashley", "Kevin", "Denise", "Gerald", "Monica", "Frank",
];

const LAST_NAMES = [
  "Anderson", "Baker", "Carter", "Davis", "Edwards", "Foster", "Griffin", "Harris",
  "Jenkins", "Kelly", "Lawson", "Mitchell", "Norris", "Owens", "Parker", "Reyes",
  "Sullivan", "Turner", "Vaughn", "Walker", "Hutchins", "Delgado", "McCray", "Boone",
];

const STREETS = [
  "Maple Ridge Dr", "Cedar Hollow Ln", "Brookstone Ct", "Willow Bend Ave",
  "Foxfire Rd", "Harvest Moon Way", "Stonegate Blvd", "Dogwood Trl",
  "Quail Run Cir", "Timberline Dr", "Old Orchard Rd", "Bellview Pike",
  "Sycamore Valley Dr", "Hickory Glen Ct", "Ashwood Ave", "Clearwater Ln",
];

const ISSUES_CRITICAL = [
  "Tarped roof section",
  "Sagging ridge line",
  "Widespread shingle loss",
  "Possible active leak staining",
  "Exposed decking",
];

const ISSUES_POOR = [
  "Missing shingles",
  "Curling and lifting shingles",
  "Heavy algae streaking",
  "Damaged or rusted flashing",
  "Exposed underlayment patch",
];

const ISSUES_FAIR = [
  "Dark algae streaking",
  "Moss growth along north face",
  "Granule loss in valleys",
  "Debris accumulation in valleys",
  "Minor flashing rust",
];

const PITCHES = ["4/12", "5/12", "6/12", "7/12", "8/12", "10/12"];

const CURRENT_MATERIALS = [
  "3-tab asphalt", "3-tab asphalt", "Architectural asphalt", "Architectural asphalt", "Metal panel",
];

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(rand: () => number, arr: T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return out;
}

export function conditionLabel(score: number): ConditionLabel {
  if (score < 40) return "Critical";
  if (score < 55) return "Poor";
  if (score < 70) return "Fair";
  return "Good";
}

function buildCondition(rand: () => number): Condition {
  const score = 28 + Math.floor(rand() * 44); // 28–71: a neglected-roof scan surfaces mostly problems
  const label = conditionLabel(score);

  let issues: string[];
  let summary: string;
  if (label === "Critical") {
    issues = [...pickN(rand, ISSUES_CRITICAL, 2), ...pickN(rand, ISSUES_POOR, 2)];
    summary =
      "Severe, visibly failing roof. High-urgency door knock — an insurance-claim conversation is likely.";
  } else if (label === "Poor") {
    issues = [...pickN(rand, ISSUES_POOR, 3), ...pickN(rand, ISSUES_FAIR, 1)];
    summary = "Multiple failure indicators. Prime replacement candidate within one to two seasons.";
  } else {
    issues = pickN(rand, ISSUES_FAIR, 2 + Math.floor(rand() * 2));
    summary = "Early neglect indicators. Good candidate for a repair plus maintenance-plan pitch.";
  }

  return { score, label, issues, summary, graded: true };
}

export function generateLead(rand: () => number, lat: number, lng: number): LeadDraft {
  const first = pick(rand, FIRST_NAMES);
  const last = pick(rand, LAST_NAMES);
  const condition = buildCondition(rand);

  const material = pick(rand, CURRENT_MATERIALS);
  const estAgeYears =
    condition.label === "Critical"
      ? 22 + Math.floor(rand() * 11)
      : condition.label === "Poor"
        ? 18 + Math.floor(rand() * 11)
        : 12 + Math.floor(rand() * 11);

  const areaSqFt = 1500 + Math.floor(rand() * 280) * 10;
  const segments = 2 + Math.floor(rand() * 5);
  const yearsOwned = 3 + Math.floor(rand() * 25);
  const assessedValue = (44 + Math.floor(rand() * 88)) * 5000; // $220k–$660k

  const lifespan =
    MATERIALS.find((m) => material.toLowerCase().includes(m.label.split(" ")[0].toLowerCase()))
      ?.lifespanYears ?? 22;

  const salesAngles: string[] = [
    `Roof is roughly ${estAgeYears} years old — ${
      estAgeYears >= lifespan ? "past" : "approaching"
    } the ${lifespan}-year service life of ${material.toLowerCase()}.`,
    `${first} has owned the home ${yearsOwned} years — likely the original roof, and probably no competing quotes yet.`,
    `Assessed at $${(assessedValue / 1000).toFixed(0)}k — frame the new roof as protecting their single largest asset.`,
  ];
  if (condition.label === "Critical") {
    salesAngles.push(
      "Severe damage is visible from the air — bring the aerial printout to the door and lead with the insurance-claim angle."
    );
  } else if (condition.issues.some((i) => /streak|moss|algae/i.test(i))) {
    salesAngles.push(
      "Cosmetic neglect signals deferred maintenance — both a soft-wash upsell and a full replacement pitch can land."
    );
  }

  return {
    address: `${100 + Math.floor(rand() * 9800)} ${pick(rand, STREETS)}`,
    city: "Nashville",
    state: "TN",
    zip: `372${10 + Math.floor(rand() * 80)}`,
    lat,
    lng,
    owner: {
      name: `${first} ${last}`,
      phone: `(615) 555-0${100 + Math.floor(rand() * 99)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      yearsOwned,
      assessedValue,
    },
    roof: {
      areaSqFt,
      pitch: pick(rand, PITCHES),
      material,
      estAgeYears,
      segments,
    },
    condition,
    status: "New",
    salesAngles,
    source: "mock",
  };
}

export function randomPointIn(rand: () => number, bounds: ScanBounds): { lat: number; lng: number } {
  return {
    lat: bounds.south + rand() * (bounds.north - bounds.south),
    lng: bounds.west + rand() * (bounds.east - bounds.west),
  };
}
