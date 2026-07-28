import Anthropic from "@anthropic-ai/sdk";
import type { Condition } from "../types";
import { conditionLabel } from "../mock";
import { liveConfig } from "./config";

const GRADE_SCHEMA = {
  type: "object",
  properties: {
    roofVisible: {
      type: "boolean",
      description:
        "False if the center of the image does NOT clearly show a real building rooftop — e.g. it's " +
        "tree canopy, an empty lot, a road, water, or the building is too obscured to make out any " +
        "roof surface at all. True only if you can actually see roofing material to grade.",
    },
    score: {
      type: "integer",
      description: "Roof condition 0-100. Higher is better. Below 40 = visibly failing, 40-54 = replace soon, 55-69 = early neglect, 70+ = healthy. Ignored when roofVisible is false.",
    },
    issues: {
      type: "array",
      items: { type: "string" },
      description: "Visible defects, most severe first, max 6. Empty if the roof looks healthy or roofVisible is false.",
    },
    summary: {
      type: "string",
      description: "One or two sentences a roofing sales rep can act on. If roofVisible is false, briefly say what's actually in the image instead (e.g. \"Center of frame is tree canopy — no rooftop visible\").",
    },
  },
  required: ["roofVisible", "score", "issues", "summary"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT =
  "You are an experienced roofing inspector grading residential roofs from close-up satellite " +
  "imagery for a roofing company that ONLY wants leads on old, neglected roofs — new and " +
  "recently-replaced roofs are worthless to them and must score high so they get filtered out. " +
  "Grade only the roof of the building at the center of the image.\n\n" +
  "First check roofVisible: the building-footprint data feeding these images is occasionally wrong " +
  "(a mistagged shed, an inaccurate coordinate, dense tree cover over a rural lot), so the center of " +
  "the image sometimes has no real rooftop in it at all. If you cannot actually see roofing material " +
  "to grade — it's trees, an empty lot, a road, water, or the structure is too obscured — set " +
  "roofVisible to false and do not force a score. This matters: scoring tree canopy as a damaged " +
  "roof sends a sales rep to a house with no bad roof to sell.\n\n" +
  "Signs of an OLD or NEGLECTED roof (score low): faded, sun-bleached, or unevenly discolored " +
  "shingles; heavy dark algae/moss streaking; missing, curling, or lifted shingle tabs; granule " +
  "loss showing bare/shiny patches; patched sections with mismatched shingle color or style " +
  "(a repair history); sagging or wavy roof planes; rust or lifted flashing; tarps; debris " +
  "buildup in valleys.\n\n" +
  "Signs of a NEW or WELL-MAINTAINED roof (score high, 80+): uniform, saturated shingle color " +
  "across every plane; crisp, straight shingle lines with no curling; no streaking or staining; " +
  "no visible patch or color mismatch anywhere on the roof. If the roof looks uniformly new, " +
  "score it 85-100 even if you can't identify a specific reason — do not invent minor flaws to " +
  "justify a lower score on a roof that otherwise looks new.\n\n" +
  "Be conservative and evidence-based either way: satellite imagery has limits, so only report " +
  "issues you can actually see, and say so in the summary when image quality limits the read.";

export type GradeOutcome =
  | { status: "graded"; condition: Condition }
  | { status: "no-roof"; summary: string }
  | { status: "unavailable" };

// Grades one rooftop with Claude vision. Returns "unavailable" when
// ANTHROPIC_API_KEY is missing or the call fails — callers fall back to an
// ungraded condition. Returns "no-roof" when the model can't actually find a
// rooftop in the image (bad footprint data, tree cover, etc.) — callers
// should drop that building entirely rather than surface it as a lead.
export async function gradeRoof(imagePng: Buffer): Promise<GradeOutcome> {
  if (!liveConfig.anthropicKey) return { status: "unavailable" };

  try {
    const client = new Anthropic({ apiKey: liveConfig.anthropicKey, timeout: 20_000 });
    const response = await client.messages.create({
      model: liveConfig.visionModel,
      max_tokens: 2000,
      thinking: { type: "adaptive" },
      output_config: { format: { type: "json_schema", schema: GRADE_SCHEMA } },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: imagePng.toString("base64"),
              },
            },
            {
              type: "text",
              text:
                "Grade the age/condition of the roof at the center of this satellite image. " +
                "Remember: this is a neglected-roof search, so a new-looking roof should score " +
                "high (80+), not moderate. If there's no real rooftop to grade, say so via roofVisible.",
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") return { status: "unavailable" };
    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) return { status: "unavailable" };

    const parsed = JSON.parse(text) as {
      roofVisible: boolean;
      score: number;
      issues: string[];
      summary: string;
    };

    if (!parsed.roofVisible) {
      return { status: "no-roof", summary: parsed.summary ?? "No rooftop visible in this image." };
    }

    const score = Math.max(0, Math.min(100, Math.round(parsed.score)));

    return {
      status: "graded",
      condition: {
        score,
        label: conditionLabel(score),
        issues: (parsed.issues ?? []).slice(0, 6),
        summary: parsed.summary ?? "",
        graded: true,
      },
    };
  } catch (err) {
    console.error("Roof grading failed:", err);
    return { status: "unavailable" };
  }
}

// No verified condition — never claim neglect, never claim it's healthy.
// See src/lib/leadFilter.ts for how `graded: false` is handled downstream.
export function ungradedCondition(): Condition {
  return {
    score: 50,
    label: "Ungraded",
    issues: [],
    summary:
      "Condition not graded — add ANTHROPIC_API_KEY to .env.local to enable AI roof inspection. " +
      "Satellite imagery is attached below for manual review.",
    graded: false,
  };
}
