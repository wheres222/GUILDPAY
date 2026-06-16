import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextBasedChannel
} from "discord.js";
import { getBotClient } from "../bot/runtime.js";
import { prisma } from "../db/prisma.js";

export type PanelPaymentMode = "CARD" | "CRYPTO" | "BOTH";

export function normalizePanelPaymentMode(value?: string): PanelPaymentMode {
  if (value === "CARD" || value === "CRYPTO") return value;
  return "BOTH";
}

function safeLabel(value: string | undefined, fallback: string) {
  const text = (value || "").trim();
  if (!text) return fallback;
  return text.slice(0, 80);
}

function buildPanelButtons(
  productId: string,
  mode: PanelPaymentMode,
  labels?: { card?: string; crypto?: string }
) {
  const row = new ActionRowBuilder<ButtonBuilder>();

  if (mode === "CARD" || mode === "BOTH") {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`buypanel:${productId}:CARD`)
        .setLabel(safeLabel(labels?.card, "Buy with Card"))
        .setStyle(ButtonStyle.Primary)
    );
  }

  if (mode === "CRYPTO" || mode === "BOTH") {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`buypanel:${productId}:CRYPTO`)
        .setLabel(safeLabel(labels?.crypto, "Buy with Crypto"))
        .setStyle(ButtonStyle.Success)
    );
  }

  return [row];
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
  paymentMode?: string;
  note?: string;
  panelTitle?: string;
  panelDescription?: string;
  imageUrl?: string;
  cardButtonLabel?: string;
  cryptoButtonLabel?: string;
}) {
  const mode = normalizePanelPaymentMode(input.paymentMode);
  const { product, variant } = await getProductForPanel({
    discordGuildId: input.discordGuildId,
    sellerDiscordUserId: input.sellerDiscordUserId,
    productId: input.productId
  });

  const priceText = `$${(variant.priceCents / 100).toFixed(2)} ${variant.currency.toUpperCase()}`;
  const methodsText =
    mode === "BOTH" ? "Card or Crypto" : mode === "CARD" ? "Card only" : "Crypto only";

  const title = (input.panelTitle || product.name).trim().slice(0, 256);
  const description = [
    input.panelDescription?.trim() || product.description || null,
    `Price: **${priceText}**`,
    `Delivery: **${variant.deliveryType}**`,
    `Payment: **${methodsText}**`,
    input.note ? `\n${input.note.trim()}` : null,
    "\nPress a button below to start checkout. You will get a private checkout link and private delivery updates."
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 3500);

  const embed = new EmbedBuilder()
    .setTitle(title || product.name)
    .setDescription(description)
    .setColor(0x5865f2);

  if (input.imageUrl) {
    embed.setImage(input.imageUrl);
  }

  const message = await input.channel.send({
    embeds: [embed],
    components: buildPanelButtons(product.id, mode, {
      card: input.cardButtonLabel,
      crypto: input.cryptoButtonLabel
    })
  });

  return {
    messageId: message.id,
    productId: product.id,
    paymentMode: mode,
    channelId: message.channelId,
    url: message.url
  };
}

export async function postProductBuyPanelByChannelId(input: {
  discordGuildId: string;
  channelId: string;
  sellerDiscordUserId: string;
  productId: string;
  paymentMode?: string;
  note?: string;
  panelTitle?: string;
  panelDescription?: string;
  imageUrl?: string;
  cardButtonLabel?: string;
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
    paymentMode: input.paymentMode,
    note: input.note,
    panelTitle: input.panelTitle,
    panelDescription: input.panelDescription,
    imageUrl: input.imageUrl,
    cardButtonLabel: input.cardButtonLabel,
    cryptoButtonLabel: input.cryptoButtonLabel
  });
}
