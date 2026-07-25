import type { Lead } from "@/lib/types";
import { hashString, mulberry32 } from "@/lib/mock";
import { number } from "@/lib/format";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Procedural "aerial photo" placeholder, seeded by lead id so each home looks
// consistent between visits. Replaced by real imagery once the Google Solar
// API / imagery provider is connected.
export default function RoofAerial({ lead }: { lead: Lead }) {
  const rand = mulberry32(hashString(lead.id));
  const issuesText = lead.condition.issues.join(" ").toLowerCase();
  const hasTarp = issuesText.includes("tarp");
  const hasMoss = /moss|algae/.test(issuesText);
  const hasStreaks = issuesText.includes("streak");
  const hasMissing = /missing|shingle loss|curling/.test(issuesText);
  const hasExposed = /exposed/.test(issuesText);

  const mainRoof: Rect = { x: 118, y: 74, w: 176, h: 118 };
  const garageRoof: Rect = { x: 294, y: 128, w: 74, h: 64 };
  const roofs = [mainRoof, garageRoof];

  const roofBase = lead.roof.material.toLowerCase().includes("metal") ? "#7d8489" : "#877f76";

  const pointOnRoof = (pad = 8) => {
    const r = roofs[rand() < 0.75 ? 0 : 1];
    return {
      x: r.x + pad + rand() * (r.w - pad * 2),
      y: r.y + pad + rand() * (r.h - pad * 2),
    };
  };

  const trees = Array.from({ length: 6 }, () => ({
    cx: 20 + rand() * 360,
    cy: rand() < 0.5 ? 20 + rand() * 40 : 210 + rand() * 30,
    r: 12 + rand() * 14,
  }));

  const streaks = hasStreaks
    ? Array.from({ length: 7 }, () => {
        const p = pointOnRoof(10);
        return { x: p.x, y: p.y, w: 3 + rand() * 5, h: 18 + rand() * 26 };
      })
    : [];

  const mossPatches = hasMoss
    ? Array.from({ length: 6 }, () => {
        const p = pointOnRoof(10);
        return { cx: p.x, cy: p.y, rx: 5 + rand() * 8, ry: 3 + rand() * 5 };
      })
    : [];

  const missing = hasMissing
    ? Array.from({ length: 9 }, () => {
        const p = pointOnRoof(6);
        return { x: p.x, y: p.y };
      })
    : [];

  const tarp = hasTarp ? { x: mainRoof.x + 14 + rand() * 60, y: mainRoof.y + 12 + rand() * 40 } : null;
  const exposed = hasExposed
    ? { x: mainRoof.x + 20 + rand() * 100, y: mainRoof.y + 50 + rand() * 40 }
    : null;

  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <svg viewBox="0 0 400 300" className="block w-full" role="img" aria-label={`Simulated aerial view of ${lead.address}`}>
        {/* lawn */}
        <rect width="400" height="300" fill="#7ca06a" />
        {trees.map((t, i) => (
          <circle key={i} cx={t.cx} cy={t.cy} r={t.r} fill="#587a45" opacity="0.85" />
        ))}

        {/* street + driveway */}
        <rect x="0" y="252" width="400" height="48" fill="#5b5e63" />
        <rect x="0" y="274" width="400" height="2.5" fill="#c8c9bd" opacity="0.7" strokeDasharray="12 10" />
        <polygon points="318,252 318,188 348,188 356,252" fill="#a9a69c" />

        {/* main roof */}
        <rect {...mainRoof} width={mainRoof.w} height={mainRoof.h} fill={roofBase} />
        <rect x={mainRoof.x} y={mainRoof.y} width={mainRoof.w} height={mainRoof.h / 2} fill="#ffffff" opacity="0.10" />
        <line
          x1={mainRoof.x}
          y1={mainRoof.y + mainRoof.h / 2}
          x2={mainRoof.x + mainRoof.w}
          y2={mainRoof.y + mainRoof.h / 2}
          stroke="#54504a"
          strokeWidth="2.5"
        />
        {/* garage roof */}
        <rect {...garageRoof} width={garageRoof.w} height={garageRoof.h} fill={roofBase} />
        <rect x={garageRoof.x} y={garageRoof.y} width={garageRoof.w} height={garageRoof.h / 2} fill="#ffffff" opacity="0.10" />
        <line
          x1={garageRoof.x}
          y1={garageRoof.y + garageRoof.h / 2}
          x2={garageRoof.x + garageRoof.w}
          y2={garageRoof.y + garageRoof.h / 2}
          stroke="#54504a"
          strokeWidth="2"
        />

        {/* condition overlays */}
        {streaks.map((s, i) => (
          <rect key={`s${i}`} x={s.x} y={s.y} width={s.w} height={s.h} fill="#2e2a26" opacity="0.28" rx="2" />
        ))}
        {mossPatches.map((m, i) => (
          <ellipse key={`m${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill="#4f7a35" opacity="0.75" />
        ))}
        {missing.map((p, i) => (
          <rect key={`x${i}`} x={p.x} y={p.y} width="7" height="4.5" fill="#3a3733" />
        ))}
        {exposed && <rect x={exposed.x} y={exposed.y} width="34" height="20" fill="#b28c5f" rx="2" />}
        {tarp && (
          <rect x={tarp.x} y={tarp.y} width="52" height="34" fill="#2563eb" stroke="#1e40af" strokeWidth="2" rx="2" />
        )}

        {/* AI detection outline */}
        <rect
          x={mainRoof.x - 6}
          y={mainRoof.y - 6}
          width={garageRoof.x + garageRoof.w - mainRoof.x + 12}
          height={mainRoof.h + 12}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="7 5"
          rx="4"
        />
        <g>
          <rect x={mainRoof.x - 6} y={mainRoof.y - 26} width="128" height="17" rx="3" fill="#f59e0b" />
          <text x={mainRoof.x} y={mainRoof.y - 14} fontSize="10.5" fontWeight="600" fill="#3b2a08">
            Roof ≈ {number(lead.roof.areaSqFt)} sq ft
          </text>
        </g>

        {/* north arrow */}
        <g transform="translate(378, 24)">
          <circle r="11" fill="#ffffff" opacity="0.85" />
          <path d="M 0 -6 L 3.5 5 L 0 2.5 L -3.5 5 Z" fill="#334155" />
          <text x="0" y="-13" fontSize="8" textAnchor="middle" fill="#334155" fontWeight="700">
            N
          </text>
        </g>
      </svg>
      <figcaption className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
        Simulated aerial view — live rooftop imagery arrives with the Google Solar API connection.
      </figcaption>
    </figure>
  );
}
