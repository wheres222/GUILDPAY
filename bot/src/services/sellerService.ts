import { PlanTier } from "@prisma/client";
import { prisma } from "../db/prisma.js";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function upsertGuildAndSeller(input: {
  discordGuildId: string;
  guildName?: string;
  discordUserId: string;
}) {
  const guild = await prisma.guild.upsert({
    where: { discordGuildId: input.discordGuildId },
    update: { name: input.guildName },
    create: {
      discordGuildId: input.discordGuildId,
      name: input.guildName
    }
  });

  const seller = await prisma.seller.upsert({
    where: {
      guildId_discordUserId: {
        guildId: guild.id,
        discordUserId: input.discordUserId
      }
    },
    update: {},
    create: {
      guildId: guild.id,
      discordUserId: input.discordUserId,
      planTier: "FREE"
    }
  });

  return { guild, seller };
}

export async function setSellerPlan(input: {
  sellerId: string;
  tier: PlanTier;
}) {
  return prisma.seller.update({
    where: { id: input.sellerId },
    data: { planTier: input.tier }
  });
}

export async function setSellerConnections(input: {
  sellerId: string;
  stripeConnectedAccountId?: string;
  cryptoPayoutAddress?: string;
  webhookDeliveryUrl?: string;
  webhookDeliverySecret?: string;
}) {
  return prisma.seller.update({
    where: { id: input.sellerId },
    data: {
      stripeConnectedAccountId: input.stripeConnectedAccountId,
      cryptoPayoutAddress: input.cryptoPayoutAddress,
      webhookDeliveryUrl: input.webhookDeliveryUrl,
      webhookDeliverySecret: input.webhookDeliverySecret
    }
  });
}

export async function createProductForSeller(input: {
  guildId: string;
  sellerId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  priceCents: number;
  currency?: string;
  deliveryType: "LICENSE_KEY" | "FILE_LINK" | "WEBHOOK";
  deliveryValue?: string;
}) {
  const baseSlug = slugify(input.name);
  let slug = baseSlug || `product-${Date.now()}`;

  for (let i = 0; i < 20; i += 1) {
    const exists = await prisma.product.findFirst({
      where: {
        guildId: input.guildId,
        slug
      },
      select: { id: true }
    });
    if (!exists) break;
    slug = `${baseSlug}-${i + 2}`;
  }

  return prisma.product.create({
    data: {
      guildId: input.guildId,
      sellerId: input.sellerId,
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      variants: {
        create: {
          name: "Default",
          priceCents: input.priceCents,
          currency: input.currency ?? "usd",
          deliveryType: input.deliveryType,
          deliveryValue: input.deliveryValue
        }
      }
    },
    include: {
      variants: true
    }
  });
}

export async function updateProductForSeller(input: {
  sellerId: string;
  productId: string;
  name?: string;
  description?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  priceCents?: number;
  deliveryType?: "LICENSE_KEY" | "FILE_LINK" | "WEBHOOK";
  deliveryValue?: string | null;
}) {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, sellerId: input.sellerId },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1
      }
    }
  });

  if (!product) throw new Error("Product not found for seller");

  const variantId = product.variants[0]?.id;

  return prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: {
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        isActive: input.isActive
      }
    });

    if (variantId && (input.priceCents !== undefined || input.deliveryType || input.deliveryValue !== undefined)) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          priceCents: input.priceCents,
          deliveryType: input.deliveryType,
          deliveryValue: input.deliveryValue
        }
      });
    }

    return tx.product.findUnique({
      where: { id: updatedProduct.id },
      include: { variants: true }
    });
  });
}

export async function listProductsByGuild(guildId: string) {
  return prisma.product.findMany({
    where: { guildId, isActive: true },
    include: { variants: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function listProductsBySeller(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId },
    include: { variants: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function findSellerByGuildAndUser(input: {
  discordGuildId: string;
  discordUserId: string;
}) {
  return prisma.seller.findFirst({
    where: {
      discordUserId: input.discordUserId,
      guild: {
        discordGuildId: input.discordGuildId
      }
    },
    include: {
      guild: true
    }
  });
}
