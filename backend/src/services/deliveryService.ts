import { DeliveryType, OrderStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";

async function deliverLicenseKey(orderItemId: string, variantId: string) {
  const key = await prisma.licenseKey.findFirst({
    where: { variantId, isUsed: false },
    orderBy: { createdAt: "asc" }
  });

  if (!key) {
    throw new Error("No available license keys in inventory for this variant.");
  }

  await prisma.licenseKey.update({
    where: { id: key.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
      orderItemId
    }
  });

  return key.value;
}

async function deliverByWebhook(deliveryUrl: string, payload: object) {
  const response = await fetch(deliveryUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Webhook delivery failed: ${response.status}`);
  }
}

export async function deliverOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      seller: true,
      items: {
        include: {
          variant: true
        }
      }
    }
  });

  if (!order) throw new Error("Order not found");
  if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.DELIVERY_PENDING) {
    return order;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.DELIVERY_PENDING }
  });

  const deliveryResults: Array<{ orderItemId: string; type: DeliveryType; value: string }> = [];

  for (const item of order.items) {
    if (item.deliveryType === DeliveryType.LICENSE_KEY) {
      const key = await deliverLicenseKey(item.id, item.variantId);
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { deliveredValue: key }
      });
      deliveryResults.push({ orderItemId: item.id, type: item.deliveryType, value: key });
      continue;
    }

    if (item.deliveryType === DeliveryType.FILE_LINK) {
      const link = item.deliveryValue || "";
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { deliveredValue: link }
      });
      deliveryResults.push({ orderItemId: item.id, type: item.deliveryType, value: link });
      continue;
    }

    if (item.deliveryType === DeliveryType.WEBHOOK) {
      const deliveryUrl = item.deliveryValue || order.seller.webhookDeliveryUrl || "";
      if (!deliveryUrl) {
        throw new Error("Missing webhook delivery URL for WEBHOOK delivery type.");
      }

      const payload = {
        orderId: order.id,
        buyerDiscordUserId: order.buyerDiscordUserId,
        item: {
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity
        }
      };

      await deliverByWebhook(deliveryUrl, payload);
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { deliveredValue: "webhook:sent" }
      });
      deliveryResults.push({ orderItemId: item.id, type: item.deliveryType, value: "webhook:sent" });
      continue;
    }
  }

  return prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.DELIVERED,
      deliveryPayload: deliveryResults
    }
  });
}
