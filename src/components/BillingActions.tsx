"use client";

import { useState } from "react";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";

function useRedirectAction(url: string, body?: object) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fallbackError: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? fallbackError);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : fallbackError);
      setLoading(false);
    }
  }

  return { run, loading, error };
}

export function UpgradeButton({
  plan,
  label,
  locale = "en",
}: {
  plan: "pro" | "apex";
  label: string;
  locale?: Locale;
}) {
  const t = dictionaries[locale].billingPage;
  const { run, loading, error } = useRedirectAction("/api/billing/checkout", { plan });
  return (
    <div>
      <button
        onClick={() => run(t.somethingWrong)}
        disabled={loading}
        className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:cursor-wait disabled:bg-amber-400"
      >
        {loading ? t.redirecting : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function ManageBillingButton({ locale = "en" }: { locale?: Locale }) {
  const t = dictionaries[locale].billingPage;
  const { run, loading, error } = useRedirectAction("/api/billing/portal");
  return (
    <div>
      <button
        onClick={() => run(t.somethingWrong)}
        disabled={loading}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:cursor-wait dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
      >
        {loading ? t.redirecting : t.manageBilling}
      </button>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function CopyReferralLink({ link, locale = "en" }: { link: string; locale?: Locale }) {
  const t = dictionaries[locale].billingPage;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (e.g. non-HTTPS, permissions) —
      // the link text is still selectable/visible, so this fails quietly.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
        {link}
      </code>
      <button
        onClick={copy}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
      >
        {copied ? t.referralCopied : t.referralCopy}
      </button>
    </div>
  );
}
