import { PaymentMethod, PaymentProvider } from "@prisma/client";
import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  TextBasedChannel
} from "discord.js";
import { PLAN_CONFIG } from "../../config/plans.js";
import { COIN_OPTIONS, coinLabel } from "../../config/coins.js";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { addLicenseKeysToVariant } from "../../services/inventoryService.js";
import {
  createOrderForVariant,
  getOrderByIdWithItems,
  listOrdersByUser,
  requestCryptoPayout,
  setOrderCheckoutReference
} from "../../services/orderService.js";
import { createNowPaymentCharge } from "../../services/nowPaymentsService.js";
import { postProductBuyPanel } from "../../services/discordPanelService.js";
import {
  createProductForSeller,
  findSellerByGuildAndUser,
  listProductsByGuild,
  listProductsBySeller,
  upsertGuildAndSeller
} from "../../services/sellerService.js";
import { ephemeralPanel, panelEdit, EPHEMERAL_V2_DEFER, type PanelButton } from "../ui/cv2.js";

const SETUP_REQUIRED = ephemeralPanel({
  title: "Setup required",
  body: "Run `/setup` first."
});

function requireGuild(interaction: ChatInputCommandInteraction | ButtonInteraction): string {
  if (!interaction.guildId) {
    throw new Error("This command can only be used inside a server.");
  }
  return interaction.guildId;
}

function asTextChannel(channel: unknown): TextBasedChannel | null {
  if (!channel) return null;
  if (typeof channel === "object" && channel && "isTextBased" in channel && typeof channel.isTextBased === "function") {
    return channel.isTextBased() ? (channel as TextBasedChannel) : null;
  }
  return null;
}

async function resolveGuildProduct(discordGuildId: string, productId: string) {
  const guild = await prisma.guild.findUnique({
    where: { discordGuildId },
    select: { id: true }
  });
  if (!guild) throw new Error("Storefront not initialized yet.");

  const product = await prisma.product.findFirst({
    where: { id: productId, guildId: guild.id, isActive: true },
    include: {
      variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      seller: true
    }
  });
  if (!product || !product.variants.length) {
    throw new Error("Product not found or unavailable.");
  }
  return { guild, product, variant: product.variants[0] };
}

/** Crypto path: create a pending order (no external link) to attach a charge to. */
async function createCryptoOrder(input: {
  discordGuildId: string;
  productId: string;
  buyerDiscordUserId: string;
}) {
  const { guild, product, variant } = await resolveGuildProduct(
    input.discordGuildId,
    input.productId
  );
  const order = await createOrderForVariant({
    guildId: guild.id,
    sellerId: product.sellerId,
    buyerDiscordUserId: input.buyerDiscordUserId,
    variantId: variant.id,
    quantity: 1,
    paymentMethod: PaymentMethod.CRYPTO,
    paymentProvider: PaymentProvider.NOWPAYMENTS
  });
  return { order, product };
}

/** Step 1 of crypto checkout: ephemeral emoji-only coin picker (button grid). */
function coinSelectPanel(orderId: string, productName: string, subtotalCents: number, currency: string) {
  const buttons: PanelButton[] = COIN_OPTIONS.map((c) => ({
    emoji: c.emoji,
    style: "secondary",
    customId: `paycoin:${orderId}:${c.value}`
  }));

  return panelEdit({
    title: `Checkout — ${productName}`,
    body:
      `Amount: **$${(subtotalCents / 100).toFixed(2)} ${currency.toUpperCase()}**\n\n` +
      "Tap a coin to pay with:",
    buttons,
    buttonColumns: 4
  });
}

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  // Coin chosen from the picker → show address + QR + timer.
  if (interaction.customId.startsWith("paycoin:")) {
    const [, orderId, coin] = interaction.customId.split(":");
    await showCryptoCharge(interaction, orderId, coin);
    return;
  }

  if (!interaction.customId.startsWith("buypanel:")) return;

  const [, productId] = interaction.customId.split(":");
  if (!productId) {
    await interaction.reply(
      ephemeralPanel({
        title: "Invalid button",
        body: "Invalid panel button payload. Ask the seller to repost the panel."
      })
    );
    return;
  }

  try {
    const discordGuildId = requireGuild(interaction);
    await interaction.deferReply(EPHEMERAL_V2_DEFER);

    // In-Discord crypto flow: pick a coin next (address/QR/timer follows).
    const { order, product } = await createCryptoOrder({
      discordGuildId,
      productId,
      buyerDiscordUserId: interaction.user.id
    });
    await interaction.editReply(
      coinSelectPanel(order.id, product.name, order.subtotalCents, order.currency)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(panelEdit({ title: "Checkout failed", body: message }));
      return;
    }

    await interaction.reply(ephemeralPanel({ title: "Checkout failed", body: message }));
  }
}

/** Step 2 of crypto checkout: coin chosen → show address + QR + expiry timer. */
async function showCryptoCharge(interaction: ButtonInteraction, orderId: string, coin: string) {
  try {
    await interaction.deferUpdate(); // edit the same ephemeral message

    const order = await getOrderByIdWithItems(orderId);
    if (!order) {
      await interaction.editReply(
        panelEdit({ title: "Checkout expired", body: "Please start checkout again." })
      );
      return;
    }

    const charge = await createNowPaymentCharge({
      orderId,
      amountUsd: order.subtotalCents / 100,
      payCurrency: coin,
      ipnCallbackUrl: `${env.BASE_URL}/api/webhooks/nowpayments`
    });

    await setOrderCheckoutReference({
      orderId,
      checkoutUrl: "",
      paymentReference: charge.paymentId
    });

    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
      charge.payAddress
    )}`;
    const expiresUnix = Math.floor(charge.expiresAt.getTime() / 1000);
    const productName = order.items[0]?.productName ?? "your order";

    await interaction.editReply(
      panelEdit({
        title: `Pay with ${coinLabel(coin)}`,
        body: [
          `**${productName}** · order \`${orderId.slice(0, 8)}\``,
          "",
          `Send exactly **${charge.payAmount} ${coin.toUpperCase()}** to this address:`,
          "```" + charge.payAddress + "```",
          `⏳ Expires <t:${expiresUnix}:R>`,
          charge.mocked
            ? "\n_Test mode — no real payment is taken. An admin can complete the order to simulate delivery._"
            : "\nYour item is delivered automatically once the network confirms the payment."
        ].join("\n"),
        mediaUrl: qr
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(panelEdit({ title: "Checkout failed", body: message }));
      } else {
        await interaction.reply(ephemeralPanel({ title: "Checkout failed", body: message }));
      }
    } catch {
      // ignore secondary failure
    }
  }
}

export async function handleInteraction(interaction: ChatInputCommandInteraction) {
  const command = interaction.commandName;

  if (command === "setup") {
    const discordGuildId = requireGuild(interaction);

    const { seller } = await upsertGuildAndSeller({
      discordGuildId,
      guildName: interaction.guild?.name,
      discordUserId: interaction.user.id
    });

    const plan = PLAN_CONFIG[seller.planTier];

    await interaction.reply(
      ephemeralPanel({
        title: "Setup complete",
        body:
          `You're on the **${plan.label}** tier.\n` +
          `Transaction fee: **${(plan.feeRate * 100).toFixed(2)}%**  •  Monthly: **$${plan.monthlyPriceUsd}**\n\n` +
          "Next: use `/product_create` to add your first product."
      })
    );
    return;
  }

  if (command === "product_create") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply(
        ephemeralPanel({ title: "Setup required", body: "Run `/setup` first before creating products." })
      );
      return;
    }

    const name = interaction.options.getString("name", true);
    const priceCents = interaction.options.getInteger("price_usd", true);
    const deliveryType = interaction.options.getString("delivery_type", true) as
      | "LICENSE_KEY"
      | "FILE_LINK"
      | "WEBHOOK";
    const deliveryValue = interaction.options.getString("delivery_value") || undefined;
    const description = interaction.options.getString("description") || undefined;

    if ((deliveryType === "FILE_LINK" || deliveryType === "WEBHOOK") && !deliveryValue) {
      await interaction.reply(
        ephemeralPanel({
          title: "Missing delivery value",
          body: "`delivery_value` is required for FILE_LINK or WEBHOOK products."
        })
      );
      return;
    }

    const product = await createProductForSeller({
      guildId: seller.guildId,
      sellerId: seller.id,
      name,
      description,
      priceCents,
      deliveryType,
      deliveryValue,
      currency: "usd"
    });

    await interaction.reply(
      ephemeralPanel({
        title: "Product created",
        body:
          `**${product.name}**\n` +
          `Product ID: \`${product.id}\`\n` +
          `Variant ID: \`${product.variants[0]?.id}\`\n` +
          `Price: **$${(priceCents / 100).toFixed(2)}**  •  Delivery: **${deliveryType}**`
      })
    );
    return;
  }

  if (command === "product_list") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply(SETUP_REQUIRED);
      return;
    }

    const products = await listProductsBySeller(seller.id);
    if (!products.length) {
      await interaction.reply(
        ephemeralPanel({ title: "No products yet", body: "Use `/product_create` to add one." })
      );
      return;
    }

    const lines = products.slice(0, 15).map((product) => {
      const variant = product.variants[0];
      return `• **${product.name}** — $${((variant?.priceCents || 0) / 100).toFixed(2)}  ·  \`${product.id}\``;
    });

    await interaction.reply(
      ephemeralPanel({ title: "Your products", body: lines.join("\n") })
    );
    return;
  }

  if (command === "panel_create") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply(
        ephemeralPanel({ title: "Setup required", body: "Run `/setup` first before posting product panels." })
      );
      return;
    }

    const productId = interaction.options.getString("product_id", true);
    const note = interaction.options.getString("note") || undefined;
    const panelTitle = interaction.options.getString("panel_title") || undefined;
    const panelDescription = interaction.options.getString("panel_description") || undefined;
    const imageUrl = interaction.options.getString("image_url") || undefined;
    const cryptoButtonLabel = interaction.options.getString("crypto_button_label") || undefined;

    const optionChannel = interaction.options.getChannel("channel");
    const channel = asTextChannel(optionChannel || interaction.channel);

    if (!channel) {
      await interaction.reply(
        ephemeralPanel({
          title: "Invalid channel",
          body: "Selected channel is not text-based. Choose a standard text channel."
        })
      );
      return;
    }

    const panel = await postProductBuyPanel({
      channel: channel as TextBasedChannel & { send: (...args: any[]) => Promise<any> },
      discordGuildId,
      sellerDiscordUserId: interaction.user.id,
      productId,
      note,
      panelTitle,
      panelDescription,
      imageUrl,
      cryptoButtonLabel
    });

    await interaction.reply(
      ephemeralPanel({
        title: "Panel posted",
        body: `Product: \`${panel.productId}\`\nChannel: \`${panel.channelId}\``,
        buttons: [{ label: "View panel", url: panel.url, style: "link" }]
      })
    );
    return;
  }

  if (command === "license_add") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply(SETUP_REQUIRED);
      return;
    }

    const productId = interaction.options.getString("product_id", true);
    const rawKeys = interaction.options.getString("keys", true);
    const values = rawKeys
      .split(/[,\n]/g)
      .map((v) => v.trim())
      .filter(Boolean);

    const product = await prisma.product.findFirst({
      where: { id: productId, sellerId: seller.id },
      include: {
        variants: { where: { isActive: true }, orderBy: { createdAt: "asc" }, take: 1 }
      }
    });

    const variantId = product?.variants[0]?.id;
    if (!variantId) {
      await interaction.reply(
        ephemeralPanel({ title: "Not found", body: "Product/variant not found." })
      );
      return;
    }

    const result = await addLicenseKeysToVariant({
      variantId,
      sellerId: seller.id,
      values
    });

    await interaction.reply(
      ephemeralPanel({
        title: "License keys updated",
        body:
          `Product \`${productId}\`\n` +
          `Created: **${result.created}**  •  Duplicates: **${result.duplicates}**  •  Available: **${result.available}**`
      })
    );
    return;
  }

  if (command === "shop") {
    const discordGuildId = requireGuild(interaction);
    const guild = await prisma.guild.findUnique({
      where: { discordGuildId },
      select: { id: true }
    });

    if (!guild) {
      await interaction.reply(
        ephemeralPanel({ title: "No storefront", body: "Ask the seller to run `/setup`." })
      );
      return;
    }

    const products = await listProductsByGuild(guild.id);
    if (!products.length) {
      await interaction.reply(
        ephemeralPanel({ title: "Storefront empty", body: "No products published yet." })
      );
      return;
    }

    const lines = products.slice(0, 20).map((product) => {
      const variant = product.variants[0];
      return `• **${product.name}** — $${((variant?.priceCents || 0) / 100).toFixed(2)}  ·  \`${product.id}\``;
    });

    await interaction.reply(
      ephemeralPanel({
        title: "Storefront",
        body: `${lines.join("\n")}\n\nUse \`/buy product_id:<id>\` to pay with crypto.`
      })
    );
    return;
  }

  if (command === "buy") {
    const discordGuildId = requireGuild(interaction);
    const productId = interaction.options.getString("product_id", true);

    await interaction.deferReply(EPHEMERAL_V2_DEFER);

    // In-Discord crypto flow: pick a coin next (address/QR/timer follows).
    const { order, product } = await createCryptoOrder({
      discordGuildId,
      productId,
      buyerDiscordUserId: interaction.user.id
    });

    await interaction.editReply(
      coinSelectPanel(order.id, product.name, order.subtotalCents, order.currency)
    );
    return;
  }

  if (command === "orders") {
    const orders = await listOrdersByUser(interaction.user.id);
    if (!orders.length) {
      await interaction.reply(
        ephemeralPanel({ title: "No orders yet", body: "Your purchases will show up here." })
      );
      return;
    }

    const lines = orders.slice(0, 10).map((order) =>
      `• \`${order.id}\` — **${order.status}** — $${(order.subtotalCents / 100).toFixed(2)} ${order.currency.toUpperCase()}`
    );

    await interaction.reply(
      ephemeralPanel({ title: "Recent orders", body: lines.join("\n") })
    );
    return;
  }

  if (command === "payout_request") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply(SETUP_REQUIRED);
      return;
    }

    const amountCents = interaction.options.getInteger("amount_usd_cents", true);
    const walletAddress = interaction.options.getString("wallet", true);

    const payout = await requestCryptoPayout({
      sellerId: seller.id,
      amountCents,
      walletAddress,
      currency: "usd"
    });

    await interaction.reply(
      ephemeralPanel({
        title: "Payout requested",
        body:
          `Request: \`${payout.id}\`\n` +
          `Amount: **$${(amountCents / 100).toFixed(2)}** → \`${walletAddress}\`\n` +
          `Status: **${payout.status}**`
      })
    );
  }
}
