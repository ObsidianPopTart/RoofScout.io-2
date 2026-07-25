"use client";

import { useEffect, useState } from "react";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";

export default function OfflineBanner({ locale = "en" }: { locale?: Locale }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-700 bg-slate-900 px-4 py-3 text-center text-sm text-white shadow-lg">
      {dictionaries[locale].offline.message}
    </div>
  );
}
