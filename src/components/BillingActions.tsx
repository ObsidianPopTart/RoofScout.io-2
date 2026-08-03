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
  highlight = false,
}: {
  plan: "pro" | "apex";
  label: string;
  locale?: Locale;
  highlight?: boolean;
}) {
  const t = dictionaries[locale].billingPage;
  const { run, loading, error } = useRedirectAction("/api/billing/checkout", { plan });
  return (
    <div>
      <button
        onClick={() => run(t.somethingWrong)}
        disabled={loading}
        className={`w-full rounded-full px-4 py-2.5 text-sm font-bold shadow-sm transition-transform hover:-translate-y-0.5 disabled:cursor-wait ${
          highlight
            ? "bg-[#1a1206] text-[var(--rs-paper)] disabled:opacity-60"
            : "bg-[var(--rs-amber)] text-[#1a1206] disabled:opacity-60"
        }`}
      >
        {loading ? t.redirecting : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function BuyScanPackButton({ locale = "en" }: { locale?: Locale }) {
  const t = dictionaries[locale].billingPage;
  const { run, loading, error } = useRedirectAction("/api/billing/checkout", { plan: "scan_pack" });
  return (
    <div>
      <button
        onClick={() => run(t.somethingWrong)}
        disabled={loading}
        className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-[var(--rs-paper)] transition-colors hover:border-white/45 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? t.redirecting : t.scanPackBuy}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
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
        className="rounded-full border border-[#1a1206]/25 px-4 py-2 text-sm font-bold text-[#1a1206] transition-colors hover:border-[#1a1206]/50 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? t.redirecting : t.manageBilling}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
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
      <code className="rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-xs text-[var(--rs-paper)]">
        {link}
      </code>
      <button
        onClick={copy}
        className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-[var(--rs-paper)] transition-colors hover:border-white/45"
      >
        {copied ? t.referralCopied : t.referralCopy}
      </button>
    </div>
  );
}
