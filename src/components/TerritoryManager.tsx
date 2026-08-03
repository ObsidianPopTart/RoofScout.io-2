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
          className="w-32 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-[var(--rs-paper)] focus:border-[var(--rs-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-amber)]/25"
        />
        <button
          onClick={addClaim}
          disabled={loading || zip.trim().length !== 5}
          className="rounded-full bg-[var(--rs-amber)] px-4 py-2 text-sm font-bold text-[#1a1206] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.territoryAdd}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-400">{error}</p>}

      <ul className="mt-4 space-y-2">
        {claims.length === 0 && <li className="text-sm text-[var(--rs-paper)]/50">{t.territoryEmpty}</li>}
        {claims.map((claim) => (
          <li
            key={claim.id}
            className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm"
          >
            <span className="font-mono text-[var(--rs-paper)]/80">{claim.zipCode}</span>
            <button
              onClick={() => removeClaim(claim.id)}
              disabled={loading}
              className="text-xs font-medium text-[var(--rs-paper)]/50 hover:text-red-400"
            >
              {t.territoryRemove}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
