import { PaymentMethod } from "@prisma/client";
import { ButtonInteraction, ChatInputCommandInteraction, TextBasedChannel } from "discord.js";
import { PLAN_CONFIG } from "../../config/plans.js";
import { prisma } from "../../db/prisma.js";
import { createCheckoutForVariant } from "../../services/checkoutService.js";
import { addLicenseKeysToVariant } from "../../services/inventoryService.js";
import { listOrdersByUser, requestCryptoPayout } from "../../services/orderService.js";
import { postProductBuyPanel } from "../../services/discordPanelService.js";
import {
  createProductForSeller,
  findSellerByGuildAndUser,
  listProductsByGuild,
  listProductsBySeller,
  upsertGuildAndSeller
} from "../../services/sellerService.js";
import { createStripeConnectOnboardingLink } from "../../services/stripeService.js";

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

async function createCheckoutFromGuildProductContext(input: {
  discordGuildId: string;
  productId: string;
  buyerDiscordUserId: string;
  paymentMethod: PaymentMethod;
  quantity: number;
}) {
  const guild = await prisma.guild.findUnique({
    where: { discordGuildId: input.discordGuildId },
    select: { id: true }
  });

  if (!guild) {
    throw new Error("Storefront not initialized yet.");
  }

  const product = await prisma.product.findFirst({
    where: { id: input.productId, guildId: guild.id, isActive: true },
    include: {
      variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      seller: true
    }
  });

  if (!product || !product.variants.length) {
    throw new Error("Product not found or unavailable.");
  }

  const variant = product.variants[0];

  const checkout = await createCheckoutForVariant({
    guildId: guild.id,
    sellerId: product.sellerId,
    buyerDiscordUserId: input.buyerDiscordUserId,
    variantId: variant.id,
    quantity: input.quantity,
    paymentMethod: input.paymentMethod,
    productName: product.name,
    sellerStripeAccountId: product.seller.stripeConnectedAccountId
  });

  return { checkout, product };
}

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  if (!interaction.customId.startsWith("buypanel:")) return;

  const [, productId, paymentMode] = interaction.customId.split(":");
  if (!productId || (paymentMode !== "CARD" && paymentMode !== "CRYPTO")) {
    await interaction.reply({
      ephemeral: true,
      content: "Invalid panel button payload. Ask seller to repost panel."
    });
    return;
  }

  try {
    const discordGuildId = requireGuild(interaction);
    await interaction.deferReply({ ephemeral: true });

    const { checkout, product } = await createCheckoutFromGuildProductContext({
      discordGuildId,
      productId,
      buyerDiscordUserId: interaction.user.id,
      paymentMethod: paymentMode as PaymentMethod,
      quantity: 1
    });

    await interaction.editReply({
      content:
        `Checkout created for **${product.name}** (${paymentMode}).\n` +
        `Order ID: \`${checkout.orderId}\`\n` +
        `Pay here: ${checkout.checkoutUrl}\n\n` +
        `After payment confirmation, delivery updates are sent privately.`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: `Could not create checkout: ${message}` });
      return;
    }

    await interaction.reply({
      ephemeral: true,
      content: `Could not create checkout: ${message}`
    });
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

    await interaction.reply({
      ephemeral: true,
      content:
        `Setup complete. You are on **${plan.label}** tier.\n` +
        `Transaction fee: **${(plan.feeRate * 100).toFixed(2)}%** | Monthly: **$${plan.monthlyPriceUsd}**\n` +
        `Next: use /product_create to add your first product.`
    });
    return;
  }

  if (command === "stripe_connect") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply({ content: "Run /setup first.", ephemeral: true });
      return;
    }

    const refreshUrl = interaction.options.getString("refresh_url", true);
    const returnUrl = interaction.options.getString("return_url", true);

    const onboarding = await createStripeConnectOnboardingLink({
      sellerId: seller.id,
      refreshUrl,
      returnUrl
    });

    await interaction.reply({
      ephemeral: true,
      content:
        `Stripe onboarding link ready (${onboarding.mocked ? "mock" : "live"}).\n` +
        `Account: \`${onboarding.accountId}\`\n` +
        `Link: ${onboarding.onboardingUrl}`
    });
    return;
  }

  if (command === "product_create") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply({
        content: "Run /setup first before creating products.",
        ephemeral: true
      });
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
      await interaction.reply({
        content: "delivery_value is required for FILE_LINK or WEBHOOK products.",
        ephemeral: true
      });
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

    await interaction.reply({
      ephemeral: true,
      content:
        `Product created: **${product.name}**\n` +
        `ID: \`${product.id}\` | Variant: \`${product.variants[0]?.id}\`\n` +
        `Price: $${(priceCents / 100).toFixed(2)} | Delivery: ${deliveryType}`
    });
    return;
  }

  if (command === "product_list") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply({ content: "Run /setup first.", ephemeral: true });
      return;
    }

    const products = await listProductsBySeller(seller.id);
    if (!products.length) {
      await interaction.reply({ content: "No products yet. Use /product_create.", ephemeral: true });
      return;
    }

    const lines = products.slice(0, 15).map((product) => {
      const variant = product.variants[0];
      return `• ${product.name} | ID: ${product.id} | $${(variant?.priceCents || 0) / 100}`;
    });

    await interaction.reply({
      ephemeral: true,
      content: `Your products:\n${lines.join("\n")}`
    });
    return;
  }

  if (command === "panel_create") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply({ content: "Run /setup first before posting product panels.", ephemeral: true });
      return;
    }

    const productId = interaction.options.getString("product_id", true);
    const paymentMode = interaction.options.getString("payment_mode") || "BOTH";
    const note = interaction.options.getString("note") || undefined;
    const panelTitle = interaction.options.getString("panel_title") || undefined;
    const panelDescription = interaction.options.getString("panel_description") || undefined;
    const imageUrl = interaction.options.getString("image_url") || undefined;
    const cardButtonLabel = interaction.options.getString("card_button_label") || undefined;
    const cryptoButtonLabel = interaction.options.getString("crypto_button_label") || undefined;

    const optionChannel = interaction.options.getChannel("channel");
    const channel = asTextChannel(optionChannel || interaction.channel);

    if (!channel) {
      await interaction.reply({
        ephemeral: true,
        content: "Selected channel is not text-based. Choose a standard text channel."
      });
      return;
    }

    const panel = await postProductBuyPanel({
      channel: channel as TextBasedChannel & { send: (...args: any[]) => Promise<any> },
      discordGuildId,
      sellerDiscordUserId: interaction.user.id,
      productId,
      paymentMode,
      note,
      panelTitle,
      panelDescription,
      imageUrl,
      cardButtonLabel,
      cryptoButtonLabel
    });

    await interaction.reply({
      ephemeral: true,
      content:
        `Panel posted successfully.\n` +
        `Product ID: \`${panel.productId}\`\n` +
        `Channel ID: \`${panel.channelId}\`\n` +
        `Message: ${panel.url}`
    });
    return;
  }

  if (command === "license_add") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply({ content: "Run /setup first.", ephemeral: true });
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
      await interaction.reply({ content: "Product/variant not found.", ephemeral: true });
      return;
    }

    const result = await addLicenseKeysToVariant({
      variantId,
      sellerId: seller.id,
      values
    });

    await interaction.reply({
      ephemeral: true,
      content:
        `License keys updated for product \`${productId}\`.\n` +
        `Created: ${result.created} | Duplicates: ${result.duplicates} | Available: ${result.available}`
    });
    return;
  }

  if (command === "shop") {
    const discordGuildId = requireGuild(interaction);
    const guild = await prisma.guild.findUnique({
      where: { discordGuildId },
      select: { id: true }
    });

    if (!guild) {
      await interaction.reply({ content: "No storefront yet. Ask seller to run /setup.", ephemeral: true });
      return;
    }

    const products = await listProductsByGuild(guild.id);
    if (!products.length) {
      await interaction.reply({ content: "No products published yet.", ephemeral: true });
      return;
    }

    const lines = products.slice(0, 20).map((product) => {
      const variant = product.variants[0];
      return `• **${product.name}** (ID: ${product.id}) — $${((variant?.priceCents || 0) / 100).toFixed(2)}`;
    });

    await interaction.reply({
      ephemeral: true,
      content: `Storefront:\n${lines.join("\n")}\n\nUse /buy product_id:<id> payment_method:CARD|CRYPTO`
    });
    return;
  }

  if (command === "buy") {
    const discordGuildId = requireGuild(interaction);
    const productId = interaction.options.getString("product_id", true);
    const paymentMethod = interaction.options.getString("payment_method", true) as PaymentMethod;
    const quantity = interaction.options.getInteger("quantity") ?? 1;

    const { checkout, product } = await createCheckoutFromGuildProductContext({
      discordGuildId,
      productId,
      buyerDiscordUserId: interaction.user.id,
      paymentMethod,
      quantity
    });

    await interaction.reply({
      ephemeral: true,
      content:
        `Checkout created for **${product.name}** (${paymentMethod}).\n` +
        `Order ID: \`${checkout.orderId}\`\n` +
        `Pay here: ${checkout.checkoutUrl}\n\n` +
        `After payment confirmation, delivery updates are sent privately.`
    });
    return;
  }

  if (command === "orders") {
    const orders = await listOrdersByUser(interaction.user.id);
    if (!orders.length) {
      await interaction.reply({ content: "No orders yet.", ephemeral: true });
      return;
    }

    const lines = orders.slice(0, 10).map((order) =>
      `• ${order.id} | ${order.status} | $${(order.subtotalCents / 100).toFixed(2)} ${order.currency.toUpperCase()}`
    );

    await interaction.reply({
      ephemeral: true,
      content: `Recent orders:\n${lines.join("\n")}`
    });
    return;
  }

  if (command === "payout_request") {
    const discordGuildId = requireGuild(interaction);
    const seller = await findSellerByGuildAndUser({
      discordGuildId,
      discordUserId: interaction.user.id
    });

    if (!seller) {
      await interaction.reply({ content: "Run /setup first.", ephemeral: true });
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

    await interaction.reply({
      ephemeral: true,
      content:
        `Payout request created: \`${payout.id}\`\n` +
        `Amount: $${(amountCents / 100).toFixed(2)} -> ${walletAddress}\n` +
        `Status: ${payout.status}`
    });
  }
}
