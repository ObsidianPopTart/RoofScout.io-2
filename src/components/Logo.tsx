// The wordmark is baked into the source image, so this renders the full
// RoofScout.io lockup (mark + "RoofScout.io") as one unit — callers should
// not also render a separate "RoofScout.io" text label next to it.
//
// Sizing: pass `height` for a fixed pixel size (most call sites — compact
// navs, form headers). Pass `responsiveClassName` instead when the logo
// needs to scale across breakpoints (e.g. "h-14 sm:h-20 lg:h-24") — it
// replaces the inline height so Tailwind's media queries can actually take
// effect; a plain `height` prop would otherwise win via inline-style
// specificity and silently ignore the classes.
export default function Logo({
  height = 28,
  responsiveClassName,
  className,
}: {
  height?: number;
  responsiveClassName?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed brand asset, no responsive/optimization needs
    <img
      src="/images/roofscout-logo.png"
      alt="RoofScout.io"
      style={responsiveClassName ? undefined : { height, width: "auto" }}
      className={[responsiveClassName, "w-auto", className].filter(Boolean).join(" ")}
    />
  );
}
