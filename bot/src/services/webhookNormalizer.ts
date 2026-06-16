import { PaymentProvider } from "@prisma/client";
import Stripe from "stripe";

export type NormalizedWebhookEvent = {
  provider: PaymentProvider;
  eventId: string;
  eventType: string;
  orderId?: string;
  paymentReference?: string;
  isPaid: boolean;
  raw: unknown;
};

export function normalizeStripeWebhook(event: Stripe.Event): NormalizedWebhookEvent {
  const eventType = event.type;

  if (eventType === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    return {
      provider: PaymentProvider.STRIPE,
      eventId: event.id,
      eventType,
      orderId: session.metadata?.orderId,
      paymentReference: session.id,
      isPaid: true,
      raw: event
    };
  }

  return {
    provider: PaymentProvider.STRIPE,
    eventId: event.id,
    eventType,
    isPaid: false,
    raw: event
  };
}

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
