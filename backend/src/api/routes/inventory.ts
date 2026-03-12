import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { addLicenseKeysToVariant, inventorySummaryBySeller } from "../../services/inventoryService.js";

export const inventoryRouter = Router();

const addLicenseKeysSchema = z.object({
  sellerId: z.string().min(1),
  productId: z.string().min(1).optional(),
  variantId: z.string().min(1).optional(),
  keys: z.array(z.string().min(1)).min(1)
}).refine((v) => Boolean(v.productId || v.variantId), {
  message: "Either productId or variantId is required"
});

const summaryParamsSchema = z.object({
  sellerId: z.string().min(1)
});

inventoryRouter.get("/inventory/seller/:sellerId/summary", async (req, res, next) => {
  try {
    const { sellerId } = summaryParamsSchema.parse(req.params);
    const products = await inventorySummaryBySeller(sellerId);
    return res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

inventoryRouter.post("/inventory/license-keys/bulk", async (req, res, next) => {
  try {
    const input = addLicenseKeysSchema.parse(req.body);

    let variantId = input.variantId;

    if (!variantId && input.productId) {
      const product = await prisma.product.findFirst({
        where: {
          id: input.productId,
          sellerId: input.sellerId,
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

      variantId = product?.variants[0]?.id;
    }

    if (!variantId) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    const result = await addLicenseKeysToVariant({
      variantId,
      sellerId: input.sellerId,
      values: input.keys
    });

    return res.status(201).json({
      success: true,
      variantId,
      ...result
    });
  } catch (error) {
    next(error);
  }
});
