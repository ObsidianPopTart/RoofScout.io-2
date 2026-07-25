import Link from "next/link";

export default function MarketingHomePage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-950 text-white">
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-semibold">RoofScout.io</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-400"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find the neglected roofs before your competitors do.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          RoofScout.io scans a neighborhood, measures every roof with satellite data, grades condition
          with AI, and hands your sales team a ranked, priced lead list — automatically.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-white hover:border-slate-500"
          >
            Log in
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        RoofScout.io
      </footer>
    </div>
  );
}
