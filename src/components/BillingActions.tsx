"use client";

import { useState } from "react";

function useRedirectAction(url: string, body?: object) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return { run, loading, error };
}

export function UpgradeButton({ plan, label }: { plan: "pro" | "apex"; label: string }) {
  const { run, loading, error } = useRedirectAction("/api/billing/checkout", { plan });
  return (
    <div>
      <button
        onClick={run}
        disabled={loading}
        className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:cursor-wait disabled:bg-amber-400"
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function ManageBillingButton() {
  const { run, loading, error } = useRedirectAction("/api/billing/portal");
  return (
    <div>
      <button
        onClick={run}
        disabled={loading}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:cursor-wait"
      >
        {loading ? "Redirecting…" : "Manage billing"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
