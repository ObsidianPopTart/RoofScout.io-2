"use client";

import { useEffect, useState } from "react";

type Step = { title: string; body: string };

export default function OnboardingTour({
  initialOpen,
  steps,
  labels,
}: {
  initialOpen: boolean;
  steps: readonly Step[];
  labels: { skip: string; back: string; next: string; done: string };
}) {
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);

  useEffect(() => {
    function handler() {
      setStep(0);
      setOpen(true);
    }
    window.addEventListener("open-onboarding-tour", handler);
    return () => window.removeEventListener("open-onboarding-tour", handler);
  }, []);

  async function finish() {
    setOpen(false);
    try {
      await fetch("/api/onboarding", { method: "POST" });
    } catch {
      // Non-critical — worst case the tour reappears next visit.
    }
  }

  if (!open) return null;

  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {step + 1} / {steps.length}
          </span>
          <button
            onClick={finish}
            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {labels.skip}
          </button>
        </div>
        <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{current.title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{current.body}</p>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === step ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
              >
                {labels.back}
              </button>
            )}
            <button
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
            >
              {isLast ? labels.done : labels.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
