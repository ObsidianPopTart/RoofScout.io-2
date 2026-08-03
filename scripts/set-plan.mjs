// Dev/testing helper: sets an org's plan tier directly, bypassing Stripe —
// for the account owner to test how each tier behaves without paying for
// real subscriptions. Not exposed anywhere in the app UI on purpose (a
// "set my own plan for free" control would be a real vulnerability if it
// ever shipped to the live site) — this is a local-only script requiring
// direct database access.
//
// Usage: node scripts/set-plan.mjs <email> <free|pro|apex> [--reset-usage]
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const [, , email, planArg, ...flags] = process.argv;
const plan = planArg?.toLowerCase();

if (!email || !["free", "pro", "apex"].includes(plan)) {
  console.error("Usage: node scripts/set-plan.mjs <email> <free|pro|apex> [--reset-usage]");
  process.exit(1);
}

const user = await prisma.user.findUnique({
  where: { email },
  include: { memberships: { include: { org: true }, take: 1 } },
});

if (!user || !user.memberships[0]) {
  console.error(`No account/organization found for ${email}`);
  process.exit(1);
}

const org = user.memberships[0].org;
const resetUsage = flags.includes("--reset-usage");

const updated = await prisma.organization.update({
  where: { id: org.id },
  data: {
    planTier: plan,
    ...(resetUsage ? { scanCountThisMonth: 0, scanCountResetAt: new Date() } : {}),
  },
});

console.log(`${org.name} (${email}) → planTier: ${updated.planTier}`);
if (resetUsage) console.log("Usage counters reset.");

await prisma.$disconnect();
