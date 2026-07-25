import type { Lead } from "./types";

// Roofing quotes are priced per "square" (100 sq ft of roof surface).
// Pitch factor converts flat footprint area to actual sloped surface area.
export const PITCH_FACTORS: Record<string, number> = {
  "4/12": 1.054,
  "5/12": 1.083,
  "6/12": 1.118,
  "7/12": 1.158,
  "8/12": 1.202,
  "10/12": 1.302,
};

export interface MaterialOption {
  id: string;
  label: string;
  lowPerSquare: number;
  highPerSquare: number;
  lifespanYears: number;
}

// Material + install pricing per square (100 sq ft), tear-off billed separately.
// Sourced 2026-07 from current US market data (Angi, HomeGuide, SquareDash,
// Homewyse, Bill Ragan Roofing, Western States Metal Roofing, FoxHaven
// Roofing) — see the assistant's cited web search in this conversation.
// Re-verify every 6-12 months; roofing material costs move with commodity
// and labor markets.
export const MATERIALS: MaterialOption[] = [
  { id: "asphalt-3tab", label: "3-tab asphalt", lowPerSquare: 380, highPerSquare: 500, lifespanYears: 18 },
  { id: "asphalt-arch", label: "Architectural asphalt", lowPerSquare: 500, highPerSquare: 700, lifespanYears: 28 },
  { id: "metal", label: "Standing-seam metal (steel/aluminum)", lowPerSquare: 1200, highPerSquare: 1700, lifespanYears: 50 },
  { id: "concrete-tile", label: "Concrete tile", lowPerSquare: 900, highPerSquare: 1800, lifespanYears: 50 },
  { id: "clay-tile", label: "Clay tile", lowPerSquare: 1700, highPerSquare: 3000, lifespanYears: 60 },
];

// Tear-off cost per square, per layer — midpoint of the 2026 national range
// ($100-180/sq for a standard single-layer asphalt tear-off). Tile and slate
// tear-offs run meaningfully higher ($200-400/sq); flag that on-site.
export const TEAR_OFF_PER_SQUARE_PER_LAYER = 150;
export const TILE_TEAR_OFF_PER_SQUARE_PER_LAYER = 300;

export interface ComplexityOption {
  id: string;
  label: string;
  factor: number;
}

export const COMPLEXITY: ComplexityOption[] = [
  { id: "simple", label: "Simple (1–2 planes)", factor: 1.0 },
  { id: "moderate", label: "Moderate (3–4 planes, valleys)", factor: 1.12 },
  { id: "complex", label: "Complex (5+ planes, dormers)", factor: 1.25 },
];

export interface QuoteInputs {
  areaSqFt: number;
  pitch: string;
  materialId: string;
  wastePct: number;
  tearOffLayers: number;
  complexityId: string;
}

export interface QuoteResult {
  squares: number;
  materialLow: number;
  materialHigh: number;
  tearOff: number;
  tearOffPerSquare: number;
  complexityFactor: number;
  low: number;
  high: number;
  mid: number;
}

function isTileMaterial(materialId: string): boolean {
  return materialId === "concrete-tile" || materialId === "clay-tile";
}

export function estimateQuote(inputs: QuoteInputs): QuoteResult {
  const pitchFactor = PITCH_FACTORS[inputs.pitch] ?? 1.118;
  const material = MATERIALS.find((m) => m.id === inputs.materialId) ?? MATERIALS[1];
  const complexity = COMPLEXITY.find((c) => c.id === inputs.complexityId) ?? COMPLEXITY[0];

  const surfaceSqFt = Math.max(0, inputs.areaSqFt) * pitchFactor * (1 + inputs.wastePct / 100);
  const squares = Math.round((surfaceSqFt / 100) * 10) / 10;

  const materialLow = squares * material.lowPerSquare;
  const materialHigh = squares * material.highPerSquare;
  const tearOffPerSquare = isTileMaterial(inputs.materialId)
    ? TILE_TEAR_OFF_PER_SQUARE_PER_LAYER
    : TEAR_OFF_PER_SQUARE_PER_LAYER;
  const tearOff = squares * tearOffPerSquare * inputs.tearOffLayers;

  const low = Math.round((materialLow + tearOff) * complexity.factor);
  const high = Math.round((materialHigh + tearOff) * complexity.factor);
  const mid = Math.round((low + high) / 2);

  return {
    squares,
    materialLow,
    materialHigh,
    tearOff,
    tearOffPerSquare,
    complexityFactor: complexity.factor,
    low,
    high,
    mid,
  };
}

export function defaultQuoteInputs(lead: Lead): QuoteInputs {
  const complexityId =
    lead.roof.segments >= 5 ? "complex" : lead.roof.segments >= 3 ? "moderate" : "simple";
  return {
    areaSqFt: lead.roof.areaSqFt,
    pitch: lead.roof.pitch,
    materialId: "asphalt-arch",
    wastePct: 15,
    tearOffLayers: 1,
    complexityId,
  };
}

export function defaultQuoteForLead(lead: Lead): QuoteResult {
  return estimateQuote(defaultQuoteInputs(lead));
}
