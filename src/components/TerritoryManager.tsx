"use client";

import { useState } from "react";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";

interface Claim {
  id: string;
  zipCode: string;
  claimedAt: string;
}

export default function TerritoryManager({
  initialClaims,
  locale = "en",
}: {
  initialClaims: Claim[];
  locale?: Locale;
}) {
  const t = dictionaries[locale].billingPage;
  const [claims, setClaims] = useState(initialClaims);
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addClaim() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/territory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode: zip }),
      });
      const data = (await res.json()) as { claim?: Claim; error?: string };
      if (!res.ok || !data.claim) throw new Error(data.error ?? t.somethingWrong);
      setClaims((prev) => [...prev, data.claim!]);
      setZip("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.somethingWrong);
    } finally {
      setLoading(false);
    }
  }

  async function removeClaim(claimId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/territory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? t.somethingWrong);
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.somethingWrong);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder={t.territoryPlaceholder}
          className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <button
          onClick={addClaim}
          disabled={loading || zip.trim().length !== 5}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
        >
          {t.territoryAdd}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <ul className="mt-4 space-y-2">
        {claims.length === 0 && <li className="text-sm text-slate-500 dark:text-slate-400">{t.territoryEmpty}</li>}
        {claims.map((claim) => (
          <li
            key={claim.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
          >
            <span className="font-mono text-slate-700 dark:text-slate-200">{claim.zipCode}</span>
            <button
              onClick={() => removeClaim(claim.id)}
              disabled={loading}
              className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              {t.territoryRemove}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
