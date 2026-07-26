import Image from "next/image";

const MARKERS = [
  { top: "38%", left: "22%", label: "POOR · 58", color: "#ec835a", delay: "1.4s" },
  { top: "58%", left: "64%", label: "FAIR · 62", color: "#fab219", delay: "2.1s" },
  { top: "22%", left: "72%", label: "CRITICAL · 41", color: "#d6432e", delay: "2.8s" },
] as const;

// The signature element: dramatizes the product's actual function (a
// satellite scan sweeping over a neighborhood, surfacing graded roofs) on
// the real hero photo, rather than a decorative animation.
export default function ScanHero() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[var(--rs-line)]">
      <Image
        src="/images/hero-neighborhood-aerial.jpg"
        alt="Aerial satellite view of a suburban neighborhood with many rooftops"
        fill
        priority
        className="object-cover"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />

      {/* corner viewfinder brackets */}
      <div className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-white/70" aria-hidden />
      <div className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-white/70" aria-hidden />
      <div className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/70" aria-hidden />
      <div className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/70" aria-hidden />

      {/* sweeping scan line */}
      <div
        className="rs-sweep-line pointer-events-none absolute inset-x-0 h-24"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(125,224,196,0.28), transparent)",
        }}
        aria-hidden
      />
      <div
        className="rs-sweep-line pointer-events-none absolute inset-x-0 h-px"
        style={{ background: "var(--rs-scan)", boxShadow: "0 0 8px 1px var(--rs-scan)" }}
        aria-hidden
      />

      {/* condition markers, popping in after the sweep passes */}
      {MARKERS.map((m) => (
        <div
          key={m.label}
          className="rs-pop pointer-events-none absolute flex items-center gap-1.5"
          style={{ top: m.top, left: m.left, animationDelay: m.delay }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full ring-2 ring-white/80"
            style={{ background: m.color }}
            aria-hidden
          />
          <span className="rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-white">
            {m.label}
          </span>
        </div>
      ))}

      {/* coordinate readout */}
      <div className="rs-fade-up pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] tracking-wider text-white/70" style={{ animationDelay: "0.9s" }}>
        36.1085°N 86.8005°W · SECTOR SCAN
      </div>
    </div>
  );
}
