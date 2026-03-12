import { DeliveryType } from "@prisma/client";
import { getBotClient } from "../bot/runtime.js";

function deliveryLines(deliveryPayload: unknown) {
  if (!Array.isArray(deliveryPayload)) return [];

  return deliveryPayload
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;

      const record = entry as {
        type?: DeliveryType;
        value?: string;
      };

      if (!record.type) return null;

      if (record.type === DeliveryType.LICENSE_KEY) {
        return `• License key: ||${record.value || "(missing)"}||`;
      }

      if (record.type === DeliveryType.FILE_LINK) {
        return `• File link: ${record.value || "(missing)"}`;
      }

      if (record.type === DeliveryType.WEBHOOK) {
        return "• Delivery webhook triggered successfully.";
      }

      return null;
    })
    .filter((line): line is string => Boolean(line));
}

async function sendDirectMessage(discordUserId: string, content: string) {
  const client = getBotClient();
  if (!client) return false;

  try {
    const user = await client.users.fetch(discordUserId);
    await user.send({ content });
    return true;
  } catch {
    return false;
  }
}

export async function notifyBuyerPaymentConfirmed(input: {
  buyerDiscordUserId: string;
  orderId: string;
  productName: string;
}) {
  const content = [
    "✅ Payment confirmed",
    `Order: \`${input.orderId}\``,
    `Product: **${input.productName}**`,
    "We are preparing your delivery now."
  ].join("\n");

  return sendDirectMessage(input.buyerDiscordUserId, content);
}

export async function notifyBuyerDeliveryComplete(input: {
  buyerDiscordUserId: string;
  orderId: string;
  productName: string;
  deliveryPayload: unknown;
}) {
  const lines = deliveryLines(input.deliveryPayload);

  const content = [
    "🎉 Delivery complete",
    `Order: \`${input.orderId}\``,
    `Product: **${input.productName}**`,
    lines.length ? lines.join("\n") : "No delivery payload was recorded.",
    "\nUse /orders in Discord to view your order history."
  ].join("\n");

  return sendDirectMessage(input.buyerDiscordUserId, content);
}

export async function notifyBuyerDeliveryFailed(input: {
  buyerDiscordUserId: string;
  orderId: string;
  reason: string;
}) {
  const content = [
    "⚠️ Delivery issue",
    `Order: \`${input.orderId}\``,
    `Reason: ${input.reason}`,
    "Please contact support with your order ID."
  ].join("\n");

  return sendDirectMessage(input.buyerDiscordUserId, content);
}
