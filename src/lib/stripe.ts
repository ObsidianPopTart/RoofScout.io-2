import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

// Falls back to a placeholder key when unset so the SDK can be constructed
// at module-eval time (Next collects page data for every route, including
// this one, before any request comes in). Every call site checks its own
// config (STRIPE_PRICE_IDS, STRIPE_WEBHOOK_SECRET) before using it for
// real, so an unconfigured deployment fails closed, not with a live key.
export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_not_configured", {
    apiVersion: "2026-06-24.dahlia",
  });

if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;

// Maps our internal plan names to Stripe Price IDs (created once via
// scripts/stripe-setup.mjs). Prices, not Products, are what Checkout needs.
export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO ?? "",
  apex: process.env.STRIPE_PRICE_APEX ?? "",
} as const;
