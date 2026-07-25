"use client";

import { useState } from "react";
import { COMPLEXITY, MATERIALS, PITCH_FACTORS, estimateQuote } from "@/lib/quote";
import { money } from "@/lib/format";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";
import { tf } from "@/lib/i18n/format";

interface Props {
  initialArea: number;
  initialPitch: string;
  initialMaterialId: string;
  initialComplexityId: string;
  locale?: Locale;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export default function QuoteCalculator({
  initialArea,
  initialPitch,
  initialMaterialId,
  initialComplexityId,
  locale = "en",
}: Props) {
  const t = dictionaries[locale].quoteCalc;
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{t.title}</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label={t.footprint}>
          <input
            type="number"
            min={0}
            value={Number.isFinite(area) ? area : ""}
            onChange={(e) => setArea(e.target.valueAsNumber)}
            className={inputClass}
          />
        </Field>
        <Field label={t.pitch}>
          <select value={pitch} onChange={(e) => setPitch(e.target.value)} className={inputClass}>
            {Object.keys(PITCH_FACTORS).map((p) => (
              <option key={p} value={p}>
                {p} (×{PITCH_FACTORS[p]})
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.newMaterial}>
          <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} className={inputClass}>
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.complexity}>
          <select value={complexityId} onChange={(e) => setComplexityId(e.target.value)} className={inputClass}>
            {COMPLEXITY.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.wasteAllowance}>
          <select value={wastePct} onChange={(e) => setWastePct(Number(e.target.value))} className={inputClass}>
            <option value={10}>10%</option>
            <option value={15}>15%</option>
            <option value={20}>20%</option>
          </select>
        </Field>
        <Field label={t.tearOffLayers}>
          <select
            value={tearOffLayers}
            onChange={(e) => setTearOffLayers(Number(e.target.value))}
            className={inputClass}
          >
            <option value={0}>{t.overlay}</option>
            <option value={1}>{t.layer}</option>
            <option value={2}>{t.layers2}</option>
          </select>
        </Field>
      </div>

      <div className="mt-5 rounded-lg bg-slate-900 px-4 py-4 text-center dark:bg-slate-950">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.suggestedQuote}</div>
        <div className="mt-1 text-3xl font-semibold text-white">{money(quote.mid)}</div>
        <div className="mt-1 text-sm text-slate-300">
          {tf(t.range, { low: money(quote.low), high: money(quote.high) })}
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">{t.roofSurface}</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">{quote.squares} {t.squares}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">{material.label}</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">
            {money(material.lowPerSquare)}–{money(material.highPerSquare)}/sq
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">{tf(t.tearOff, { rate: quote.tearOffPerSquare })}</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">{money(Math.round(quote.tearOff))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">{t.complexityFactor}</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">×{quote.complexityFactor}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{t.disclaimer}</p>
    </div>
  );
}
