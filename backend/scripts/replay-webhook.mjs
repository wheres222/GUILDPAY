#!/usr/bin/env node
import crypto from "node:crypto";
import Stripe from "stripe";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const provider = (process.argv[2] || "nowpayments").toLowerCase();
const orderId = process.argv[3] || "test-order-id";

async function sendNowpayments() {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) {
    throw new Error("NOWPAYMENTS_IPN_SECRET is required for replay");
  }

  const payload = JSON.stringify({
    payment_id: `replay_${Date.now()}`,
    order_id: orderId,
    payment_status: "finished",
    price_amount: 10,
    price_currency: "usd"
  });

  const signature = crypto.createHmac("sha512", secret).update(payload).digest("hex");

  const res = await fetch(`${base}/api/webhooks/nowpayments`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-nowpayments-sig": signature
    },
    body: payload
  });

  console.log("NOWPayments replay", res.status, await res.text());
}

async function sendStripe() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required for replay");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");
  const payload = JSON.stringify({
    id: `evt_replay_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_replay_${Date.now()}`,
        metadata: { orderId }
      }
    }
  });

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret
  });

  const res = await fetch(`${base}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature
    },
    body: payload
  });

  console.log("Stripe replay", res.status, await res.text());
}

(async () => {
  if (provider === "stripe") {
    await sendStripe();
    return;
  }

  await sendNowpayments();
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
