import Image from "next/image";

// Parent-company credit — Lunchbox owns and operates RoofScout.io. Shown in the
// footer of every public marketing/blog page, below the existing nav links.
export default function LunchboxBadge() {
  return (
    <div className="mt-2 flex items-center justify-center gap-1.5 text-[var(--rs-paper)]/30">
      <span>By</span>
      <Image src="/images/lunchbox-logo.png" alt="Lunchbox" width={18} height={18} className="rounded-sm" />
      <span>Lunchbox</span>
    </div>
  );
}
