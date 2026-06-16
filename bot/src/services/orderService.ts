import {
  DeliveryType,
  LedgerEntryType,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PlanTier,
  Prisma,
  WebhookEventStatus
} from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { feeRateForTier } from "../config/plans.js";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  PENDING_PAYMENT: [OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.CANCELLED],
  PAID: [OrderStatus.DELIVERY_PENDING, OrderStatus.DELIVERED, OrderStatus.REFUNDED],
  DELIVERY_PENDING: [OrderStatus.DELIVERED, OrderStatus.FAILED],
  DELIVERED: [OrderStatus.REFUNDED],
  FAILED: [],
  REFUNDED: [],
  CANCELLED: []
};

export async function createOrderForVariant(input: {
  guildId: string;
  sellerId: string;
  buyerDiscordUserId: string;
  variantId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
}) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
    include: {
      product: {
        include: {
          seller: true
        }
      }
    }
  });

  if (!variant || !variant.isActive || !variant.product.isActive) {
    throw new Error("Variant not available");
  }

  if (variant.product.guildId !== input.guildId || variant.product.sellerId !== input.sellerId) {
    throw new Error("Variant does not belong to seller/guild context");
  }

  const planTier: PlanTier = variant.product.seller.planTier;
  const subtotalCents = variant.priceCents * input.quantity;
  const platformFeeCents = Math.round(subtotalCents * feeRateForTier(planTier));
  const sellerNetCents = Math.max(0, subtotalCents - platformFeeCents);

  return prisma.order.create({
    data: {
      guildId: input.guildId,
      sellerId: input.sellerId,
      buyerDiscordUserId: input.buyerDiscordUserId,
      status: OrderStatus.PENDING_PAYMENT,
      paymentMethod: input.paymentMethod,
      paymentProvider: input.paymentProvider,
      currency: variant.currency,
      subtotalCents,
      platformFeeCents,
      sellerNetCents,
      items: {
        create: {
          variantId: variant.id,
          productName: variant.product.name,
          variantName: variant.name,
          quantity: input.quantity,
          unitPriceCents: variant.priceCents,
          totalPriceCents: subtotalCents,
          deliveryType: variant.deliveryType,
          deliveryValue: variant.deliveryValue
        }
      }
    },
    include: {
      items: true,
      seller: true
    }
  });
}

export async function setOrderCheckoutReference(input: {
  orderId: string;
  checkoutUrl: string;
  paymentReference: string;
}) {
  return prisma.order.update({
    where: { id: input.orderId },
    data: {
      checkoutUrl: input.checkoutUrl,
      paymentReference: input.paymentReference
    }
  });
}

export async function transitionOrderStatus(orderId: string, nextStatus: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      return order;
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus
      }
    });
  });
}

export async function markOrderPaid(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    const payableStatuses: OrderStatus[] = [OrderStatus.PENDING_PAYMENT, OrderStatus.CREATED];
    if (!payableStatuses.includes(order.status)) {
      return order;
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID }
    });

    await tx.ledgerEntry.createMany({
      data: [
        {
          sellerId: order.sellerId,
          orderId: order.id,
          type: LedgerEntryType.SELLER_CREDIT,
          amountCents: order.sellerNetCents,
          currency: order.currency
        },
        {
          orderId: order.id,
          type: LedgerEntryType.PLATFORM_FEE,
          amountCents: order.platformFeeCents,
          currency: order.currency
        }
      ]
    });

    return updated;
  });
}

export async function findOrderByPaymentReference(paymentReference: string) {
  return prisma.order.findFirst({
    where: { paymentReference },
    include: { items: true }
  });
}

export async function getOrderByIdWithItems(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
}

export async function listOrdersByUser(discordUserId: string) {
  return prisma.order.findMany({
    where: { buyerDiscordUserId: discordUserId },
    orderBy: { createdAt: "desc" }
  });
}

export async function saveWebhookEventIdempotent(input: {
  provider: PaymentProvider;
  eventId: string;
  eventType?: string;
  orderId?: string;
  paymentReference?: string;
  payload?: unknown;
}) {
  try {
    const event = await prisma.webhookEvent.create({
      data: {
        provider: input.provider,
        eventId: input.eventId,
        eventType: input.eventType,
        orderId: input.orderId,
        paymentReference: input.paymentReference,
        status: WebhookEventStatus.RECEIVED,
        payload: input.payload as Prisma.InputJsonValue
      }
    });
    return { isNew: true, id: event.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { isNew: false };
    }
    throw error;
  }
}

export async function markWebhookEventVerified(provider: PaymentProvider, eventId: string) {
  await prisma.webhookEvent.updateMany({
    where: { provider, eventId },
    data: {
      status: WebhookEventStatus.VERIFIED,
      verifiedAt: new Date()
    }
  });
}

export async function markWebhookEventProcessed(input: {
  provider: PaymentProvider;
  eventId: string;
  orderId?: string;
}) {
  await prisma.webhookEvent.updateMany({
    where: { provider: input.provider, eventId: input.eventId },
    data: {
      status: WebhookEventStatus.PROCESSED,
      orderId: input.orderId,
      processedAt: new Date(),
      failureReason: null
    }
  });
}

export async function markWebhookEventFailed(input: {
  provider: PaymentProvider;
  eventId: string;
  reason: string;
  orderId?: string;
}) {
  await prisma.webhookEvent.updateMany({
    where: { provider: input.provider, eventId: input.eventId },
    data: {
      status: WebhookEventStatus.FAILED,
      orderId: input.orderId,
      processedAt: new Date(),
      failureReason: input.reason
    }
  });
}

export async function listPayoutRequestsBySeller(input: {
  sellerId: string;
  limit?: number;
}) {
  return prisma.payoutRequest.findMany({
    where: { sellerId: input.sellerId },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(input.limit || 25, 200))
  });
}

export async function requestCryptoPayout(input: {
  sellerId: string;
  amountCents: number;
  walletAddress: string;
  currency?: string;
}) {
  const MIN_PAYOUT_REQUEST_CENTS = 500;
  const MAX_PENDING_PAYOUTS = 5;

  const [balance, pendingCount] = await Promise.all([
    prisma.ledgerEntry.aggregate({
      where: { sellerId: input.sellerId },
      _sum: { amountCents: true }
    }),
    prisma.payoutRequest.count({
      where: { sellerId: input.sellerId, status: "PENDING" }
    })
  ]);

  const available = balance._sum.amountCents || 0;

  if (input.amountCents <= 0) {
    throw new Error("Amount must be positive");
  }

  if (input.amountCents < MIN_PAYOUT_REQUEST_CENTS) {
    throw new Error(`Minimum payout request is ${MIN_PAYOUT_REQUEST_CENTS} cents`);
  }

  if (pendingCount >= MAX_PENDING_PAYOUTS) {
    throw new Error("Too many pending payout requests. Wait for current requests to settle.");
  }

  if (input.amountCents > available) {
    throw new Error("Insufficient seller balance for payout request");
  }

  const normalizedCurrency = (input.currency ?? "usd").toLowerCase();

  return prisma.$transaction(async (tx) => {
    const payout = await tx.payoutRequest.create({
      data: {
        sellerId: input.sellerId,
        amountCents: input.amountCents,
        walletAddress: input.walletAddress,
        currency: normalizedCurrency,
        status: "PENDING"
      }
    });

    await tx.ledgerEntry.create({
      data: {
        sellerId: input.sellerId,
        orderId: null,
        type: LedgerEntryType.PAYOUT_DEBIT,
        amountCents: -input.amountCents,
        currency: normalizedCurrency,
        metadata: { payoutRequestId: payout.id }
      }
    });

    return payout;
  });
}
