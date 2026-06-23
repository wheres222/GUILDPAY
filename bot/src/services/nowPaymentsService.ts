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
      is_fixed_rate: false,
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

function mockAddress(payCurrency: string, seed: string): string {
  const hash = crypto.createHash("sha256").update(`${payCurrency}:${seed}`).digest("hex");
  const c = payCurrency.toLowerCase();
  if (c.startsWith("btc")) return `bc1q${hash.slice(0, 38)}`;
  if (c.startsWith("ltc")) return `ltc1q${hash.slice(0, 38)}`;
  if (c.startsWith("sol")) return hash.slice(0, 44);
  // eth / usdt(erc/trc) / usdc / default → evm-style hex
  return `0x${hash.slice(0, 40)}`;
}

/**
 * Create an on-address crypto charge for paying inside Discord (address + amount
 * for a chosen coin). Falls back to a deterministic mock when no API key is set,
 * so the in-Discord flow is fully testable locally.
 */
export async function createNowPaymentCharge(input: {
  orderId: string;
  amountUsd: number;
  payCurrency: string;
  ipnCallbackUrl: string;
}): Promise<{
  paymentId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  expiresAt: Date;
  mocked: boolean;
}> {
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 min window

  if (!features.nowPaymentsEnabled) {
    return {
      paymentId: `mock_${input.orderId}`,
      payAddress: mockAddress(input.payCurrency, input.orderId),
      payAmount: Number(input.amountUsd.toFixed(2)),
      payCurrency: input.payCurrency,
      expiresAt,
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
      pay_currency: input.payCurrency,
      order_id: input.orderId,
      ipn_callback_url: input.ipnCallbackUrl,
      is_fixed_rate: false,
      is_fee_paid_by_user: false
    })
  });

  if (!response.ok) {
    throw new Error(`NOWPayments charge failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as NowPaymentResponse & {
    pay_amount?: number;
    pay_currency?: string;
  };

  return {
    paymentId: String(data.payment_id || input.orderId),
    payAddress: String(data.pay_address || ""),
    payAmount: Number(data.pay_amount || input.amountUsd),
    payCurrency: String(data.pay_currency || input.payCurrency),
    expiresAt,
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
