const Stripe = require("stripe");
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const PRICE_MAP = { starter: process.env.STRIPE_PRICE_STARTER, pro: process.env.STRIPE_PRICE_PRO, label: process.env.STRIPE_PRICE_LABEL };

async function createCheckoutSession({ plan, userId }) {
  const price = PRICE_MAP[plan];
  if (!stripe || !price) return { provider: "stripe-demo", checkoutUrl: "https://checkout.stripe.com/demo", plan, userId };
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/cancel`,
    metadata: { userId, plan }
  });
  return { provider: "stripe", checkoutUrl: session.url, sessionId: session.id };
}
module.exports = { createCheckoutSession };
