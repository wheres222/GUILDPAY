#!/usr/bin/env node
import crypto from "node:crypto";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const orderId = process.argv[2] || "test-order-id";

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

sendNowpayments().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
