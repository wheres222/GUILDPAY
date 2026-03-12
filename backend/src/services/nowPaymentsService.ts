import crypto from "node:crypto";
import { env, features } from "../config/env.js";

type NowPaymentResponse = {
  payment_id?: string;
  invoice_url?: string;
  pay_address?: string;
  [key: string]: unknown;
};

export async function createNowPaymentInvoice(input: {
  orderId: string;
  amountUsd: number;
  description: string;
  ipnCallbackUrl: string;
}) {
  if (!features.nowPaymentsEnabled) {
    return {
      id: `mock_now_${input.orderId}`,
      url: `${env.BASE_URL}/mock/crypto-checkout/${input.orderId}`,
      mocked: true
    };
  }

  const response = await fetch(`${env.NOWPAYMENTS_BASE_URL}/payment`, {
    method: "POST",
    headers: {
      "x-api-key": env.NOWPAYMENTS_API_KEY as string,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      price_amount: Number(input.amountUsd.toFixed(2)),
      price_currency: "usd",
      pay_currency: env.NOWPAYMENTS_PAY_CURRENCY,
      order_id: input.orderId,
      order_description: input.description,
      ipn_callback_url: input.ipnCallbackUrl,
      is_fixed_rate: true,
      is_fee_paid_by_user: false
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`NOWPayments invoice create failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as NowPaymentResponse;

  return {
    id: String(data.payment_id || input.orderId),
    url: String(data.invoice_url || data.pay_address || `${env.BASE_URL}/mock/crypto-checkout/${input.orderId}`),
    mocked: false
  };
}

export function verifyNowpaymentsSignature(rawBody: Buffer, signatureHeader: string): boolean {
  if (!env.NOWPAYMENTS_IPN_SECRET) return false;
  const digest = crypto
    .createHmac("sha512", env.NOWPAYMENTS_IPN_SECRET)
    .update(rawBody)
    .digest("hex");

  return digest === signatureHeader;
}
