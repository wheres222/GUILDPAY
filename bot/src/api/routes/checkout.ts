import { PaymentMethod } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { createCheckoutForVariant } from "../../services/checkoutService.js";

export const checkoutRouter = Router();

const createCheckoutSchema = z.object({
  discordGuildId: z.string().min(1),
  sellerDiscordUserId: z.string().min(1),
  buyerDiscordUserId: z.string().min(1),
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  paymentMethod: z.nativeEnum(PaymentMethod)
});

checkoutRouter.post("/checkout/create", async (req, res, next) => {
  try {
    const input = createCheckoutSchema.parse(req.body);

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
      return res.status(404).json({ success: false, message: "Seller not found for this guild." });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: input.productId,
        sellerId: seller.id,
        guildId: seller.guildId,
        isActive: true
      },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!product || product.variants.length === 0) {
      return res.status(404).json({ success: false, message: "Product/variant not available." });
    }

    const variant =
      input.variantId
        ? product.variants.find((v) => v.id === input.variantId)
        : product.variants[0];

    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found." });
    }

    const result = await createCheckoutForVariant({
      guildId: seller.guildId,
      sellerId: seller.id,
      buyerDiscordUserId: input.buyerDiscordUserId,
      variantId: variant.id,
      quantity: input.quantity,
      paymentMethod: input.paymentMethod,
      productName: product.name,
      sellerStripeAccountId: seller.stripeConnectedAccountId
    });

    return res.status(201).json({
      success: true,
      orderId: result.orderId,
      provider: result.provider,
      mocked: result.mocked,
      checkoutUrl: result.checkoutUrl,
      paymentReference: result.paymentReference
    });
  } catch (error) {
    next(error);
  }
});
