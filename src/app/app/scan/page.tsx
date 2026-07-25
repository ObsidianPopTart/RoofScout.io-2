import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ScanMap from "@/components/ScanMap";

export const metadata = {
  title: "New Scan — RoofScout.io",
};

export default async function ScanPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">New scan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Frame a neighborhood, then let the AI grade every rooftop in view.
      </p>
      <div className="mt-5">
        <ScanMap />
      </div>
    </div>
  );
}
