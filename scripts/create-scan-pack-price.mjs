// Creates just the one-time "10-Scan Pack" product+price in Stripe, without
// touching the existing Pro/Apex subscription products or webhook endpoint
// (unlike stripe-setup.mjs, which isn't safe to re-run — it always creates
// NEW products, so re-running the whole script would duplicate Pro/Apex).
// Usage: STRIPE_SECRET_KEY=sk_... node scripts/create-scan-pack-price.mjs
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Set STRIPE_SECRET_KEY in the environment first.");

const stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });

const product = await stripe.products.create({ name: "RoofScout 10-Scan Pack" });
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 1900,
  currency: "usd",
});

console.log(`Scan Pack: product=${product.id} price=${price.id}`);
console.log(`\nSet this environment variable (locally in .env.local, and in Netlify for production):`);
console.log(`STRIPE_PRICE_SCAN_PACK=${price.id}`);
