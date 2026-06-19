import { TextBasedChannel } from "discord.js";
import { getBotClient } from "../bot/runtime.js";
import { prisma } from "../db/prisma.js";
import { panelMessage, type PanelButton } from "../bot/ui/cv2.js";

function safeLabel(value: string | undefined, fallback: string) {
  const text = (value || "").trim();
  if (!text) return fallback;
  return text.slice(0, 80);
}

function buildPanelButtons(
  productId: string,
  cryptoLabel?: string
): PanelButton[] {
  return [
    {
      customId: `buypanel:${productId}`,
      label: safeLabel(cryptoLabel, "Buy with Crypto"),
      style: "success"
    }
  ];
}

export async function getProductForPanel(input: {
  discordGuildId: string;
  sellerDiscordUserId: string;
  productId: string;
}) {
  const seller = await prisma.seller.findFirst({
    where: {
      discordUserId: input.sellerDiscordUserId,
      guild: {
        discordGuildId: input.discordGuildId
      }
    },
    include: {
      guild: true
    }
  });

  if (!seller) {
    throw new Error("Seller not found for this guild. Run /setup first.");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: input.productId,
      guildId: seller.guildId,
      sellerId: seller.id,
      isActive: true
    },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1
      }
    }
  });

  if (!product || !product.variants.length) {
    throw new Error("Product not found or has no active variant.");
  }

  return {
    seller,
    product,
    variant: product.variants[0]
  };
}

export async function postProductBuyPanel(input: {
  channel: TextBasedChannel & { send: (...args: any[]) => Promise<any> };
  discordGuildId: string;
  sellerDiscordUserId: string;
  productId: string;
  note?: string;
  panelTitle?: string;
  panelDescription?: string;
  imageUrl?: string;
  cryptoButtonLabel?: string;
}) {
  const { product, variant } = await getProductForPanel({
    discordGuildId: input.discordGuildId,
    sellerDiscordUserId: input.sellerDiscordUserId,
    productId: input.productId
  });

  const priceText = `$${(variant.priceCents / 100).toFixed(2)} ${variant.currency.toUpperCase()}`;

  const title = (input.panelTitle || product.name).trim().slice(0, 256);
  const description = [
    input.panelDescription?.trim() || product.description || null,
    `Price: **${priceText}**`,
    `Delivery: **${variant.deliveryType}**`,
    `Payment: **Crypto**`,
    input.note ? `\n${input.note.trim()}` : null,
    "\nPress the button below to start checkout. You will pick a coin and get a private address, QR code, and delivery updates."
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 3500);

  const message = await input.channel.send(
    panelMessage({
      title: title || product.name,
      body: description,
      mediaUrl: input.imageUrl, // opt-in: only shows a banner if provided
      buttons: buildPanelButtons(product.id, input.cryptoButtonLabel)
    })
  );

  return {
    messageId: message.id,
    productId: product.id,
    channelId: message.channelId,
    url: message.url
  };
}

export async function postProductBuyPanelByChannelId(input: {
  discordGuildId: string;
  channelId: string;
  sellerDiscordUserId: string;
  productId: string;
  note?: string;
  panelTitle?: string;
  panelDescription?: string;
  imageUrl?: string;
  cryptoButtonLabel?: string;
}) {
  const client = getBotClient();
  if (!client) {
    throw new Error("Discord bot is not connected.");
  }

  const guild = await client.guilds.fetch(input.discordGuildId);
  const channel = await guild.channels.fetch(input.channelId);

  if (!channel || !channel.isTextBased() || !("send" in channel) || typeof channel.send !== "function") {
    throw new Error("Target channel is not sendable text channel.");
  }

  return postProductBuyPanel({
    channel: channel as TextBasedChannel & { send: (...args: any[]) => Promise<any> },
    discordGuildId: input.discordGuildId,
    sellerDiscordUserId: input.sellerDiscordUserId,
    productId: input.productId,
    note: input.note,
    panelTitle: input.panelTitle,
    panelDescription: input.panelDescription,
    imageUrl: input.imageUrl,
    cryptoButtonLabel: input.cryptoButtonLabel
  });
}
