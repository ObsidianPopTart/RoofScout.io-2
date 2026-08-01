import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PRICE_IDS, SCAN_PACK_CREDITS } from "@/lib/stripe";
import { applyReferralRewardOnFirstConversion } from "@/lib/referral";
import { releaseAllTerritoriesForOrg } from "@/lib/territory";

function planForPriceId(priceId: string | undefined): "pro" | "apex" | null {
  if (priceId === STRIPE_PRICE_IDS.pro) return "pro";
  if (priceId === STRIPE_PRICE_IDS.apex) return "apex";
  return null;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId ?? session.client_reference_id;
      if (!orgId) break;

      // One-time scan-credit pack — no subscription involved, just add the
      // credits. Handled separately from the subscription flow below since
      // session.subscription is never set for a mode: "payment" Checkout.
      if (session.metadata?.type === "scan_pack") {
        await prisma.organization.update({
          where: { id: orgId },
          data: { scanCreditBalance: { increment: SCAN_PACK_CREDITS } },
        });
        break;
      }

      if (typeof session.subscription !== "string") break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const plan = planForPriceId(subscription.items.data[0]?.price.id);
      if (!plan) break;

      await prisma.organization.update({
        where: { id: orgId },
        data: {
          planTier: plan,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId: subscription.id,
        },
      });

      // "Give a month, get a month": this is the org's first confirmed paid
      // conversion via Checkout — the moment the referral reward (if any)
      // fires for both this org and whoever referred them. Idempotent, so a
      // duplicate/retried webhook delivery never double-grants it.
      await applyReferralRewardOnFirstConversion(orgId);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata?.orgId;
      if (!orgId) break;

      if (subscription.status === "active" || subscription.status === "trialing") {
        const plan = planForPriceId(subscription.items.data[0]?.price.id);
        if (plan) {
          await prisma.organization.update({ where: { id: orgId }, data: { planTier: plan } });
          // Territory exclusivity is an Apex-only perk — downgrading to Pro
          // while still subscribed shouldn't let claims linger for free.
          if (plan !== "apex") await releaseAllTerritoriesForOrg(orgId);
        }
      } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
        await prisma.organization.update({
          where: { id: orgId },
          data: { planTier: "free", stripeSubscriptionId: null },
        });
        await releaseAllTerritoriesForOrg(orgId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata?.orgId;
      if (!orgId) break;

      await prisma.organization.update({
        where: { id: orgId },
        data: { planTier: "free", stripeSubscriptionId: null },
      });
      await releaseAllTerritoriesForOrg(orgId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
