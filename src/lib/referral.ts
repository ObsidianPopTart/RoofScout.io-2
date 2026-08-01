import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { stripe } from "./stripe";

// "Give a month, get a month." See RoofScout_Outreach_Copy_Pack.docx section 5
// for the copy/mechanics this implements: every org gets a shareable link
// from day one; the reward (one free month for both sides) fires on the
// referred org's FIRST paid conversion, not on free signup, to avoid abuse.

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I — avoids misreads when read aloud or handwritten
const CODE_LENGTH = 8;

function randomCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

type DbClient = typeof prisma | Prisma.TransactionClient;

// Call inside the signup transaction, before creating the Organization row —
// collisions are astronomically unlikely (33^8 space) but checked anyway
// since referralCode is a unique column.
export async function generateUniqueReferralCode(db: DbClient = prisma): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const existing = await db.organization.findUnique({ where: { referralCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique referral code after 5 attempts");
}

// Resolves a `?ref=` code from a signup link to the referring org's id.
// Returns null for a missing/unknown code rather than throwing — a bad or
// stale referral code should never block signup.
export async function resolveReferrerOrgId(refCode: string | null | undefined): Promise<string | null> {
  const trimmed = refCode?.trim();
  if (!trimmed) return null;
  const org = await prisma.organization.findUnique({
    where: { referralCode: trimmed.toUpperCase() },
    select: { id: true },
  });
  return org?.id ?? null;
}

// Stripe coupon (100% off, duration "once") used to apply a free month.
// Created once via `node scripts/stripe-setup.mjs` (see REFERRAL_FREE_MONTH_COUPON
// in its output) and read from the environment here. Reward-granting degrades
// to banking a credit — rather than throwing — when it isn't configured, so a
// missing env var can't break checkout or the billing webhook.
function freeMonthCouponId(): string | null {
  return process.env.REFERRAL_FREE_MONTH_COUPON_ID || null;
}

// Applies a free month to an org's active Stripe subscription, or banks it
// as a pending credit (auto-consumed at their next checkout, see
// consumePendingFreeMonthForCheckout below) if they don't have one yet —
// e.g. the referrer is still on the Free plan when their referral converts.
async function grantFreeMonth(orgId: string): Promise<void> {
  const couponId = freeMonthCouponId();
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId } });

  if (org.stripeSubscriptionId && couponId) {
    try {
      await stripe.subscriptions.update(org.stripeSubscriptionId, {
        discounts: [{ coupon: couponId }],
      });
      return;
    } catch (err) {
      console.error(`Referral reward: failed to apply coupon to org ${orgId}, banking credit instead`, err);
    }
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { pendingFreeMonthCredits: { increment: 1 } },
  });
}

// Call from the Stripe webhook the moment an org's paid subscription is
// confirmed (checkout.session.completed). Idempotent against webhook
// retries/duplicate deliveries: the conditional updateMany only "claims" the
// reward once, so concurrent calls for the same org grant it at most once.
export async function applyReferralRewardOnFirstConversion(orgId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { referredByOrgId: true },
  });
  if (!org?.referredByOrgId) return; // this org didn't sign up via a referral link

  const claim = await prisma.organization.updateMany({
    where: { id: orgId, referralRewardAppliedAt: null },
    data: { referralRewardAppliedAt: new Date() },
  });
  if (claim.count === 0) return; // already applied — no-op

  await Promise.all([grantFreeMonth(orgId), grantFreeMonth(org.referredByOrgId)]);
}

// Call from the checkout route right before creating a Stripe Checkout
// Session. If this org is owed a banked free month, returns the coupon id to
// attach to the session (applies to the first invoice) and atomically
// consumes one credit. Best-effort: an abandoned checkout still spends the
// credit — acceptable for v1, and simpler than reconciling against
// checkout.session.expired.
export async function consumePendingFreeMonthForCheckout(orgId: string): Promise<string | null> {
  const couponId = freeMonthCouponId();
  if (!couponId) return null;

  const claim = await prisma.organization.updateMany({
    where: { id: orgId, pendingFreeMonthCredits: { gt: 0 } },
    data: { pendingFreeMonthCredits: { decrement: 1 } },
  });
  return claim.count > 0 ? couponId : null;
}

export interface ReferralStats {
  code: string;
  link: string;
  pending: number;
  converted: number;
}

// Powers the "X pending, Y converted" line on the billing page.
export async function getReferralStats(orgId: string, baseUrl: string): Promise<ReferralStats> {
  const [org, referrals] = await Promise.all([
    prisma.organization.findUniqueOrThrow({ where: { id: orgId }, select: { referralCode: true } }),
    prisma.organization.findMany({
      where: { referredByOrgId: orgId },
      select: { referralRewardAppliedAt: true },
    }),
  ]);
  const converted = referrals.filter((r) => r.referralRewardAppliedAt !== null).length;
  return {
    code: org.referralCode,
    link: `${baseUrl.replace(/\/$/, "")}/r/${org.referralCode}`,
    pending: referrals.length - converted,
    converted,
  };
}
