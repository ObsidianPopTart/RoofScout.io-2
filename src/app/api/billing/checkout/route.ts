import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { consumePendingFreeMonthForCheckout } from "@/lib/referral";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { plan?: string } | null;
  const plan = body?.plan;
  if (plan !== "pro" && plan !== "apex") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
  }

  const org = await prisma.organization.findUniqueOrThrow({ where: { id: session.user.orgId } });
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

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
