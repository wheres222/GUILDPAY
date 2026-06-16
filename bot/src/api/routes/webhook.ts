import { PaymentProvider, WebhookEventStatus } from "@prisma/client";
import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { env, features } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { deliverOrder } from "../../services/deliveryService.js";
import {
  notifyBuyerDeliveryComplete,
  notifyBuyerDeliveryFailed,
  notifyBuyerPaymentConfirmed
} from "../../services/discordNotificationService.js";
import {
  findOrderByPaymentReference,
  getOrderByIdWithItems,
  markOrderPaid,
  markWebhookEventFailed,
  markWebhookEventProcessed,
  markWebhookEventVerified,
  saveWebhookEventIdempotent
} from "../../services/orderService.js";
import { stripe } from "../../services/stripeService.js";
import { verifyNowpaymentsSignature } from "../../services/nowPaymentsService.js";
import {
  NormalizedWebhookEvent,
  normalizeNowpaymentsWebhook,
  normalizeStripeWebhook
} from "../../services/webhookNormalizer.js";

export const webhookRouter = Router();

const webhookEventsQuerySchema = z.object({
  provider: z.nativeEnum(PaymentProvider).optional(),
  status: z.nativeEnum(WebhookEventStatus).optional(),
  orderId: z.string().min(1).optional(),
  sellerId: z.string().min(1).optional(),
  limit: z.coerce.number().int().positive().max(200).optional()
});

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown processing error";
}

async function processNormalizedWebhookEvent(normalized: NormalizedWebhookEvent) {
  await markWebhookEventVerified(normalized.provider, normalized.eventId);

  let resolvedOrderId = normalized.orderId;

  if (normalized.isPaid && !resolvedOrderId && normalized.paymentReference) {
    const order = await findOrderByPaymentReference(normalized.paymentReference);
    resolvedOrderId = order?.id;
  }

  if (normalized.isPaid && !resolvedOrderId) {
    throw new Error("Unable to resolve order for paid webhook event");
  }

  if (normalized.isPaid && resolvedOrderId) {
    const paidOrder = await markOrderPaid(resolvedOrderId);
    const paidOrderWithItems = await getOrderByIdWithItems(paidOrder.id);

    await notifyBuyerPaymentConfirmed({
      buyerDiscordUserId: paidOrder.buyerDiscordUserId,
      orderId: paidOrder.id,
      productName: paidOrderWithItems?.items?.[0]?.productName || "Your order"
    });

    try {
      const deliveredOrder = await deliverOrder(resolvedOrderId);
      const deliveredOrderWithItems = await getOrderByIdWithItems(deliveredOrder.id);

      await notifyBuyerDeliveryComplete({
        buyerDiscordUserId: deliveredOrder.buyerDiscordUserId,
        orderId: deliveredOrder.id,
        productName: deliveredOrderWithItems?.items?.[0]?.productName || "Your order",
        deliveryPayload: deliveredOrder.deliveryPayload
      });
    } catch (deliveryError) {
      await notifyBuyerDeliveryFailed({
        buyerDiscordUserId: paidOrder.buyerDiscordUserId,
        orderId: paidOrder.id,
        reason: errorMessage(deliveryError)
      });
      throw deliveryError;
    }
  }

  await markWebhookEventProcessed({
    provider: normalized.provider,
    eventId: normalized.eventId,
    orderId: resolvedOrderId
  });
}

webhookRouter.get("/webhooks/events", async (req, res, next) => {
  try {
    const query = webhookEventsQuerySchema.parse(req.query);

    let orderFilter: string[] | undefined;

    if (query.sellerId) {
      const sellerOrders = await prisma.order.findMany({
        where: { sellerId: query.sellerId },
        select: { id: true },
        take: 500
      });

      orderFilter = sellerOrders.map((order) => order.id);
    }

    const events = await prisma.webhookEvent.findMany({
      where: {
        provider: query.provider,
        status: query.status,
        orderId: query.orderId
          ? query.orderId
          : orderFilter
            ? { in: orderFilter }
            : undefined
      },
      orderBy: { receivedAt: "desc" },
      take: query.limit ?? 50
    });

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

webhookRouter.post("/webhooks/stripe", async (req, res) => {
  if (!stripe || !features.stripeEnabled || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ success: false, message: "Stripe webhook not configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).json({ error: "Missing stripe-signature" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const normalized = normalizeStripeWebhook(event);

  const saved = await saveWebhookEventIdempotent({
    provider: normalized.provider,
    eventId: normalized.eventId,
    eventType: normalized.eventType,
    orderId: normalized.orderId,
    paymentReference: normalized.paymentReference,
    payload: normalized.raw
  });

  if (!saved.isNew) {
    return res.status(200).json({ received: true, deduped: true });
  }

  try {
    await processNormalizedWebhookEvent(normalized);
    return res.status(200).json({ received: true });
  } catch (error) {
    await markWebhookEventFailed({
      provider: normalized.provider,
      eventId: normalized.eventId,
      orderId: normalized.orderId,
      reason: errorMessage(error)
    });
    return res.status(500).json({ received: false, message: "Webhook processing failed" });
  }
});

webhookRouter.post("/webhooks/nowpayments", async (req, res) => {
  if (!features.nowPaymentsEnabled || !env.NOWPAYMENTS_IPN_SECRET) {
    return res.status(503).json({ success: false, message: "NOWPayments webhook not configured" });
  }

  const signature = req.headers["x-nowpayments-sig"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).json({ success: false, message: "Missing x-nowpayments-sig" });
  }

  const raw = req.body as Buffer;
  if (!verifyNowpaymentsSignature(raw, signature)) {
    return res.status(400).json({ success: false, message: "Invalid NOWPayments signature" });
  }

  let payload: {
    payment_id?: string | number;
    order_id?: string;
    payment_status?: string;
  };

  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ success: false, message: "Invalid JSON payload" });
  }

  const normalized = normalizeNowpaymentsWebhook(payload);

  const saved = await saveWebhookEventIdempotent({
    provider: normalized.provider,
    eventId: normalized.eventId,
    eventType: normalized.eventType,
    orderId: normalized.orderId,
    paymentReference: normalized.paymentReference,
    payload: normalized.raw
  });

  if (!saved.isNew) {
    return res.status(200).json({ received: true, deduped: true });
  }

  try {
    await processNormalizedWebhookEvent(normalized);
    return res.status(200).json({ received: true });
  } catch (error) {
    await markWebhookEventFailed({
      provider: normalized.provider,
      eventId: normalized.eventId,
      orderId: normalized.orderId,
      reason: errorMessage(error)
    });
    return res.status(500).json({ received: false, message: "Webhook processing failed" });
  }
});
