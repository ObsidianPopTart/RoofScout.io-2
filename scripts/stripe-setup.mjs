// One-time setup: creates the Pro/Apex Products+Prices and a webhook
// endpoint in Stripe via the API (no dashboard clicking required).
// Usage: STRIPE_SECRET_KEY=sk_... node scripts/stripe-setup.mjs <webhook-url>
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const webhookUrl = process.argv[2];
if (!key) throw new Error("Set STRIPE_SECRET_KEY in the environment first.");
if (!webhookUrl) throw new Error("Usage: node scripts/stripe-setup.mjs <webhook-url>");

const stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });

async function upsertPlan(name, unitAmount) {
  const product = await stripe.products.create({ name: `RoofScout ${name}` });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: "usd",
    recurring: { interval: "month" },
  });
  console.log(`${name}: product=${product.id} price=${price.id}`);
  return price.id;
}

const proPriceId = await upsertPlan("Pro", 4900);
const apexPriceId = await upsertPlan("Apex", 14900);

const webhook = await stripe.webhookEndpoints.create({
  url: webhookUrl,
  enabled_events: [
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ],
});
console.log(`webhook: id=${webhook.id} secret=${webhook.secret}`);

// "Give a month, get a month" referral reward — 100% off, applies once (i.e.
// one free billing cycle). See src/lib/referral.ts for how it's applied.
const referralCoupon = await stripe.coupons.create({
  name: "RoofScout referral reward — 1 free month",
  percent_off: 100,
  duration: "once",
});
console.log(`referral coupon: id=${referralCoupon.id}`);

console.log("\nSet these environment variables:");
console.log(`STRIPE_PRICE_PRO=${proPriceId}`);
console.log(`STRIPE_PRICE_APEX=${apexPriceId}`);
console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
console.log(`REFERRAL_FREE_MONTH_COUPON_ID=${referralCoupon.id}`);
