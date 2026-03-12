import { OrderStatus, WebhookEventStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";

function initStatusMap() {
  return {
    CREATED: 0,
    PENDING_PAYMENT: 0,
    PAID: 0,
    DELIVERY_PENDING: 0,
    DELIVERED: 0,
    FAILED: 0,
    REFUNDED: 0,
    CANCELLED: 0
  } as Record<OrderStatus, number>;
}

export async function sellerSummary(sellerId: string) {
  const [productsCount, orders, ledger] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),
    prisma.order.findMany({
      where: { sellerId },
      select: {
        status: true,
        subtotalCents: true,
        platformFeeCents: true,
        sellerNetCents: true
      }
    }),
    prisma.ledgerEntry.aggregate({
      where: { sellerId },
      _sum: { amountCents: true }
    })
  ]);

  const statusCounts = initStatusMap();
  let grossCents = 0;
  let feeCents = 0;
  let sellerNetCents = 0;

  for (const order of orders) {
    statusCounts[order.status] += 1;
    grossCents += order.subtotalCents;
    feeCents += order.platformFeeCents;
    sellerNetCents += order.sellerNetCents;
  }

  return {
    productsCount,
    ordersCount: orders.length,
    grossCents,
    feeCents,
    sellerNetCents,
    availableBalanceCents: ledger._sum.amountCents || 0,
    statusCounts
  };
}

export async function sellerOrders(
  sellerId: string,
  limit = 25,
  statuses?: OrderStatus[]
) {
  return prisma.order.findMany({
    where: {
      sellerId,
      ...(statuses && statuses.length ? { status: { in: statuses } } : {})
    },
    include: {
      items: true
    },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 100))
  });
}

export async function sellerProfile(sellerId: string) {
  return prisma.seller.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      discordUserId: true,
      planTier: true,
      stripeConnectedAccountId: true,
      cryptoPayoutAddress: true,
      webhookDeliveryUrl: true,
      webhookDeliverySecret: true,
      guild: {
        select: {
          id: true,
          discordGuildId: true,
          name: true
        }
      }
    }
  });
}

export async function sellerRiskMetrics(sellerId: string) {
  const orders = await prisma.order.findMany({
    where: { sellerId },
    select: { id: true, status: true }
  });

  const orderIds = orders.map((o) => o.id);
  const webhookFailedCount = orderIds.length
    ? await prisma.webhookEvent.count({
        where: {
          orderId: { in: orderIds },
          status: WebhookEventStatus.FAILED
        }
      })
    : 0;

  const failedOrders = orders.filter((o) => o.status === OrderStatus.FAILED).length;
  const refundedOrders = orders.filter((o) => o.status === OrderStatus.REFUNDED).length;
  const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING_PAYMENT).length;
  const deliveredOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;

  const denominator = Math.max(orders.length, 1);

  return {
    totalOrders: orders.length,
    deliveredOrders,
    failedOrders,
    refundedOrders,
    pendingOrders,
    webhookFailedCount,
    fraudRatePct: Number((((failedOrders + refundedOrders) / denominator) * 100).toFixed(2))
  };
}
