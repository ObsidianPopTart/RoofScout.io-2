import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { liveConfig } from "@/lib/live/config";
import { SUPPORT_SYSTEM_PROMPT, SUPPORT_EMAIL } from "@/lib/support/knowledge";

// Anonymous, stateless support chat — no session binding, so cost/abuse
// control lives entirely in these caps rather than per-user rate limiting.
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 1000;

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!liveConfig.anthropicKey) {
    return NextResponse.json(
      { reply: `Support chat isn't configured yet — please email ${SUPPORT_EMAIL} and we'll help directly.` },
      { status: 200 }
    );
  }

  try {
    const client = new Anthropic({ apiKey: liveConfig.anthropicKey, timeout: 20_000 });
    const response = await client.messages.create({
      model: liveConfig.supportModel,
      max_tokens: 500,
      system: SUPPORT_SYSTEM_PROMPT,
      messages: parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text || response.stop_reason === "refusal") {
      return NextResponse.json({
        reply: `I'm not able to help with that here — email ${SUPPORT_EMAIL} and a person will follow up.`,
      });
    }

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Support chat failed:", err);
    return NextResponse.json(
      { reply: `Something went wrong on our end — please email ${SUPPORT_EMAIL} for help.` },
      { status: 200 }
    );
  }
}
