// Live-mode configuration. RoofScout runs in demo (mock) mode until
// GOOGLE_MAPS_API_KEY is present in .env.local — then scans use real data.
export const liveConfig = {
  get googleKey(): string {
    return process.env.GOOGLE_MAPS_API_KEY ?? "";
  },
  get anthropicKey(): string {
    return process.env.ANTHROPIC_API_KEY ?? "";
  },
  get maxBuildingsPerScan(): number {
    return Number(process.env.ROOFSCOUT_MAX_BUILDINGS ?? 15);
  },
  get visionModel(): string {
    return process.env.ROOFSCOUT_VISION_MODEL ?? "claude-opus-4-8";
  },
};

export function isLiveMode(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY);
}
