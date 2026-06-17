import { DeliveryType } from "@prisma/client";
import { getBotClient } from "../bot/runtime.js";
import { panelMessage, type PanelSpec } from "../bot/ui/cv2.js";

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

async function sendDirectPanel(discordUserId: string, spec: PanelSpec) {
  const client = getBotClient();
  if (!client) return false;

  try {
    const user = await client.users.fetch(discordUserId);
    await user.send(panelMessage(spec));
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
  return sendDirectPanel(input.buyerDiscordUserId, {
    title: "✅ Payment confirmed",
    body: [
      `Product: **${input.productName}**`,
      `Order: \`${input.orderId}\``,
      "",
      "We're preparing your delivery now."
    ].join("\n")
  });
}

export async function notifyBuyerDeliveryComplete(input: {
  buyerDiscordUserId: string;
  orderId: string;
  productName: string;
  deliveryPayload: unknown;
}) {
  const lines = deliveryLines(input.deliveryPayload);

  return sendDirectPanel(input.buyerDiscordUserId, {
    title: "🎉 Delivery complete",
    body: [
      `Product: **${input.productName}**`,
      `Order: \`${input.orderId}\``,
      "",
      lines.length ? lines.join("\n") : "No delivery payload was recorded.",
      "",
      "Use `/orders` to view your order history."
    ].join("\n")
  });
}

export async function notifyBuyerDeliveryFailed(input: {
  buyerDiscordUserId: string;
  orderId: string;
  reason: string;
}) {
  return sendDirectPanel(input.buyerDiscordUserId, {
    title: "⚠️ Delivery issue",
    body: [
      `Order: \`${input.orderId}\``,
      `Reason: ${input.reason}`,
      "",
      "Please contact support with your order ID."
    ].join("\n")
  });
}
