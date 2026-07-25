"use client";

import type { Locale } from "@/lib/i18n/dictionaries";

export default function LocaleToggle({ locale, className }: { locale: Locale; className?: string }) {
  function toggle() {
    const next: Locale = locale === "en" ? "es" : "en";
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <button onClick={toggle} className={className} aria-label="Toggle language">
      {locale === "en" ? "ES" : "EN"}
    </button>
  );
}
