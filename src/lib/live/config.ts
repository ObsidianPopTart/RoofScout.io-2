// Live-mode configuration. RoofScout runs in demo (mock) mode until
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
  get visionModel(): string {
    return process.env.ROOFSCOUT_VISION_MODEL ?? "claude-opus-4-8";
  },
  get supportModel(): string {
    return process.env.ROOFSCOUT_SUPPORT_MODEL ?? "claude-haiku-4-5";
  },
};

export function isLiveMode(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY);
}
