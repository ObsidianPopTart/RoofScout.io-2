import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false }, // internal tool — real per-org data, never indexed
};

function RoofLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12 L12 3 L22 12" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 11.5 V20 H19 V11.5" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: src/proxy.ts already gates /app/:path* by redirecting
  // unauthenticated visits to /login, but every page re-checks the session
  // itself too — a proxy matcher change should never be the only thing
  // standing between an unauthenticated request and real customer data.
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <nav className="bg-slate-900 text-white">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-8 px-4">
          <Link href="/app" className="flex items-center gap-2 text-lg font-semibold">
            <RoofLogo />
            RoofScout
          </Link>
          <div className="flex gap-6 text-sm text-slate-300">
            <Link href="/app" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/app/scan" className="hover:text-white">
              New Scan
            </Link>
            <Link href="/app/leads" className="hover:text-white">
              Leads
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm text-slate-300">
            <span>{session.user.orgName}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
