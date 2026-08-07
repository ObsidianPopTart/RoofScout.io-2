// Live-mode configuration. RoofScout.io runs in demo (mock) mode until
// GOOGLE_MAPS_API_KEY is present in .env.local — then scans use real data.
export const liveConfig = {
  get googleKey(): string {
    return process.env.GOOGLE_MAPS_API_KEY ?? "";
  },
  get anthropicKey(): string {
    return process.env.ANTHROPIC_API_KEY ?? "";
  },
  // Scans cover every building in the visible area — this only bounds how
  // many buildings are analyzed concurrently, to stay within Solar/vision
  // provider rate limits, not how many total a scan will inspect.
  get scanConcurrency(): number {
    return Number(process.env.ROOFSCOUT_SCAN_CONCURRENCY ?? 25);
  },
  // Opus + adaptive thinking on every single roof (one call per building in
  // the scan area) is the single biggest cost driver in the whole app — a
  // 292-building scan burned ~$12 in Anthropic credits. Haiku is dramatically
  // cheaper and the grading task (read visible shingle wear off a satellite
  // photo, no multi-step reasoning needed) doesn't need Opus-tier judgment or
  // extended thinking — see gradeRoof() in vision.ts, which also dropped the
  // `thinking` param for the same reason.
  get visionModel(): string {
    return process.env.ROOFSCOUT_VISION_MODEL ?? "claude-haiku-4-5";
  },
  get supportModel(): string {
    return process.env.ROOFSCOUT_SUPPORT_MODEL ?? "claude-haiku-4-5";
  },
};

export function isLiveMode(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY);
}
