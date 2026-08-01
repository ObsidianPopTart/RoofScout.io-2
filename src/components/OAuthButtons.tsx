import { signInWithGoogle } from "@/lib/oauthActions";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export default function OAuthButtons({ divider, googleLabel }: { divider: string; googleLabel: string }) {
  if (!googleEnabled) return null;

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-[var(--rs-paper)]/40">
        <div className="h-px flex-1 bg-white/10" />
        {divider}
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2.5 text-sm font-medium text-[var(--rs-paper)] transition-colors hover:bg-black/35"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.1C3.24 21.3 7.29 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.26A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0 7.29 0 3.24 2.7 1.26 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77z"
            />
          </svg>
          {googleLabel}
        </button>
      </form>
    </div>
  );
}
