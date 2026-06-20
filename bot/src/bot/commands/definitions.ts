import { ChannelType, SlashCommandBuilder } from "discord.js";

export const commandDefinitions = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Initialize your server storefront (defaults to Free plan)."),

  new SlashCommandBuilder()
    .setName("product_create")
    .setDescription("Create a product for this server")
    .addStringOption((opt) =>
      opt.setName("name").setDescription("Product name").setRequired(true)
    )
    .addNumberOption((opt) =>
      opt.setName("price_usd").setDescription("Price in US dollars (e.g., 4.99)").setMinValue(0.01).setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("delivery_type")
        .setDescription("How this product is delivered")
        .setRequired(true)
        .addChoices(
          { name: "LICENSE_KEY", value: "LICENSE_KEY" },
          { name: "FILE_LINK", value: "FILE_LINK" },
          { name: "WEBHOOK", value: "WEBHOOK" }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("delivery_value")
        .setDescription("For FILE_LINK add URL; for WEBHOOK add endpoint")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("description").setDescription("Optional product description").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("product_list")
    .setDescription("List your seller products in this server"),

  new SlashCommandBuilder()
    .setName("panel_create")
    .setDescription("Post a persistent buy panel for a product in a channel")
    .addStringOption((opt) =>
      opt.setName("product_id").setDescription("Product ID to attach to the panel").setRequired(true)
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Target channel for the panel (defaults to current channel)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("note")
        .setDescription("Optional extra note shown in panel")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("panel_title")
        .setDescription("Optional custom panel title")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("panel_description")
        .setDescription("Optional custom panel description")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("image_url")
        .setDescription("Optional image URL for panel embed")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("crypto_button_label")
        .setDescription("Optional custom label for the buy button")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("license_add")
    .setDescription("Add license keys to a LICENSE_KEY product")
    .addStringOption((opt) =>
      opt.setName("product_id").setDescription("Product ID to add keys to").setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("keys")
        .setDescription("Keys separated by commas or newlines")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Browse products available in this server"),

  new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy a product with crypto")
    .addStringOption((opt) =>
      opt.setName("product_id").setDescription("Product ID").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName("quantity").setDescription("Quantity").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("orders")
    .setDescription("View your recent buyer orders"),

  new SlashCommandBuilder()
    .setName("payout_request")
    .setDescription("Request crypto payout of your seller balance")
    .addIntegerOption((opt) =>
      opt.setName("amount_usd_cents").setDescription("Payout amount in USD cents").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("wallet").setDescription("Wallet address to receive payout").setRequired(true)
    )
].map((c) => c.toJSON());
