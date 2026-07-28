import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizePlanTier } from "@/lib/usage";
import ScanMap from "@/components/ScanMap";
import { getDictionary } from "@/lib/i18n/getLocale";

export const metadata = {
  title: "New Scan — RoofScout",
};

export default async function ScanPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { locale, t } = await getDictionary();
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: session.user.orgId } });
  const planTier = normalizePlanTier(org.planTier);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t.scanPage.title}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.scanPage.subtitle}</p>
      <div className="mt-5">
        <ScanMap locale={locale} planTier={planTier} />
      </div>
    </div>
  );
}
