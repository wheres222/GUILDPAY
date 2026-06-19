import { PaymentProvider } from "@prisma/client";

export type NormalizedWebhookEvent = {
  provider: PaymentProvider;
  eventId: string;
  eventType: string;
  orderId?: string;
  paymentReference?: string;
  isPaid: boolean;
  raw: unknown;
};

export function normalizeNowpaymentsWebhook(payload: {
  payment_id?: string | number;
  order_id?: string;
  payment_status?: string;
}): NormalizedWebhookEvent {
  const eventId = String(payload.payment_id || payload.order_id || `now_${Date.now()}`);
  const status = (payload.payment_status || "").toLowerCase();
  const isPaid = status === "finished" || status === "confirmed";

  return {
    provider: PaymentProvider.NOWPAYMENTS,
    eventId,
    eventType: `payment.${status || "unknown"}`,
    orderId: payload.order_id,
    paymentReference: payload.payment_id ? String(payload.payment_id) : undefined,
    isPaid,
    raw: payload
  };
}
