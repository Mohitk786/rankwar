import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export function getStripe(): Stripe {
  if (!globalForStripe.stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add your Stripe test-mode secret key to .env before using checkout."
      );
    }
    globalForStripe.stripe = new Stripe(key);
  }
  return globalForStripe.stripe;
}
