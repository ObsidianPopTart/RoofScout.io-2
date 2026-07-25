export default function Logo({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* magnifying glass — "scouting" the roof */}
      <circle cx="13" cy="13" r="9" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2.4" />
      <line
        x1="19.5"
        y1="19.5"
        x2="27"
        y2="27"
        className="stroke-slate-400 dark:stroke-slate-500"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* rooftop, seen through the lens */}
      <path
        d="M7 15 L13 9 L19 15"
        stroke="#f59e0b"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 14.5 V19 H17 V14.5"
        className="stroke-slate-300 dark:stroke-slate-400"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
