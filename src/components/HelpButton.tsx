"use client";

export default function HelpButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-onboarding-tour"))}
      aria-label="Show tour"
      title="Show tour"
      className={className}
    >
      ?
    </button>
  );
}
