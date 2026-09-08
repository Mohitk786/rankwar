import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const eventId = process.argv[2];
if (!eventId) {
  console.error("Usage: node scripts/e2e-webhook-replay-test.mjs <event_id>");
  process.exit(1);
}

async function main() {
  const event = await stripe.events.retrieve(eventId);
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });

  for (let i = 1; i <= 2; i++) {
    const res = await fetch("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: { "content-type": "application/json", "stripe-signature": header },
      body: payload,
    });
    const data = await res.json();
    console.log(`Replay #${i}:`, res.status, data);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
