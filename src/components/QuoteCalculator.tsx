"use client";

import { useState } from "react";
import { COMPLEXITY, MATERIALS, PITCH_FACTORS, estimateQuote } from "@/lib/quote";
import { money } from "@/lib/format";

interface Props {
  initialArea: number;
  initialPitch: string;
  initialMaterialId: string;
  initialComplexityId: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function QuoteCalculator({
  initialArea,
  initialPitch,
  initialMaterialId,
  initialComplexityId,
}: Props) {
  const [area, setArea] = useState(initialArea);
  const [pitch, setPitch] = useState(initialPitch);
  const [materialId, setMaterialId] = useState(initialMaterialId);
  const [wastePct, setWastePct] = useState(15);
  const [tearOffLayers, setTearOffLayers] = useState(1);
  const [complexityId, setComplexityId] = useState(initialComplexityId);

  const quote = estimateQuote({
    areaSqFt: Number.isFinite(area) ? area : 0,
    pitch,
    materialId,
    wastePct,
    tearOffLayers,
    complexityId,
  });

  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[1];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800">Quote calculator</h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Pre-filled from this roof&apos;s scan data. Adjust on the doorstep.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="Footprint (sq ft)">
          <input
            type="number"
            min={0}
            value={Number.isFinite(area) ? area : ""}
            onChange={(e) => setArea(e.target.valueAsNumber)}
            className={inputClass}
          />
        </Field>
        <Field label="Pitch">
          <select value={pitch} onChange={(e) => setPitch(e.target.value)} className={inputClass}>
            {Object.keys(PITCH_FACTORS).map((p) => (
              <option key={p} value={p}>
                {p} (×{PITCH_FACTORS[p]})
              </option>
            ))}
          </select>
        </Field>
        <Field label="New material">
          <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} className={inputClass}>
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Complexity">
          <select value={complexityId} onChange={(e) => setComplexityId(e.target.value)} className={inputClass}>
            {COMPLEXITY.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Waste allowance">
          <select value={wastePct} onChange={(e) => setWastePct(Number(e.target.value))} className={inputClass}>
            <option value={10}>10%</option>
            <option value={15}>15%</option>
            <option value={20}>20%</option>
          </select>
        </Field>
        <Field label="Tear-off layers">
          <select
            value={tearOffLayers}
            onChange={(e) => setTearOffLayers(Number(e.target.value))}
            className={inputClass}
          >
            <option value={0}>None (overlay)</option>
            <option value={1}>1 layer</option>
            <option value={2}>2 layers</option>
          </select>
        </Field>
      </div>

      <div className="mt-5 rounded-lg bg-slate-900 px-4 py-4 text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Suggested quote</div>
        <div className="mt-1 text-3xl font-semibold text-white">{money(quote.mid)}</div>
        <div className="mt-1 text-sm text-slate-300">
          range {money(quote.low)} – {money(quote.high)}
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Roof surface (pitch + waste)</dt>
          <dd className="font-medium text-slate-800">{quote.squares} squares</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{material.label}</dt>
          <dd className="font-medium text-slate-800">
            {money(material.lowPerSquare)}–{money(material.highPerSquare)}/sq
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Tear-off (${quote.tearOffPerSquare}/sq)</dt>
          <dd className="font-medium text-slate-800">{money(Math.round(quote.tearOff))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Complexity factor</dt>
          <dd className="font-medium text-slate-800">×{quote.complexityFactor}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-slate-400">
        Ballpark for the doorstep conversation — final pricing needs an on-roof inspection.
        Material rates reflect 2026 US national averages and should be checked against your
        local supplier and labor costs before quoting.
      </p>
    </div>
  );
}
