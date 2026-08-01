import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PRICE_IDS, SCAN_PACK_PRICE_ID } from "@/lib/stripe";
import { consumePendingFreeMonthForCheckout } from "@/lib/referral";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { plan?: string } | null;
  const plan = body?.plan;
  if (plan !== "pro" && plan !== "apex" && plan !== "scan_pack") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const org = await prisma.organization.findUniqueOrThrow({ where: { id: session.user.orgId } });
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  // Scan packs are a one-time payment, not a subscription — no plan change,
  // no referral coupon (that's a subscription-only reward), just credits
  // added by the webhook once payment is confirmed.
  if (plan === "scan_pack") {
    if (!SCAN_PACK_PRICE_ID) {
      return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: SCAN_PACK_PRICE_ID, quantity: 1 }],
      customer: org.stripeCustomerId ?? undefined,
      customer_email: org.stripeCustomerId ? undefined : (session.user.email ?? undefined),
      client_reference_id: org.id,
      metadata: { orgId: org.id, type: "scan_pack" },
      success_url: `${origin}/app/billing?checkout=success`,
      cancel_url: `${origin}/app/billing?checkout=cancelled`,
    });
    return NextResponse.json({ url: checkoutSession.url });
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
  }

  // If this org is owed a banked referral free-month (see src/lib/referral.ts
  // — banked because they had no active subscription when the reward was
  // granted), spend it now so it applies to this subscription's first invoice.
  const referralCoupon = await consumePendingFreeMonthForCheckout(org.id);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: org.stripeCustomerId ?? undefined,
    customer_email: org.stripeCustomerId ? undefined : session.user.email ?? undefined,
    client_reference_id: org.id,
    metadata: { orgId: org.id, plan },
    subscription_data: { metadata: { orgId: org.id, plan } },
    ...(referralCoupon ? { discounts: [{ coupon: referralCoupon }] } : {}),
    success_url: `${origin}/app/billing?checkout=success`,
    cancel_url: `${origin}/app/billing?checkout=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
