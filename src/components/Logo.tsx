// The wordmark is baked into the source image, so this renders the full
// RoofScout.io lockup (mark + "RoofScout.io") as one unit — callers should
// not also render a separate "RoofScout.io" text label next to it.
export default function Logo({ height = 28, className }: { height?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed brand asset, no responsive/optimization needs
    <img
      src="/images/roofscout-logo.png"
      alt="RoofScout.io"
      height={height}
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
