import { DeliveryType } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import {
  createProductForSeller,
  listProductsByGuild,
  listProductsBySeller,
  updateProductForSeller
} from "../../services/sellerService.js";

export const productsRouter = Router();

const createProductSchema = z.object({
  guildId: z.string().min(1),
  sellerId: z.string().min(1),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  priceCents: z.number().int().positive(),
  currency: z.string().default("usd"),
  deliveryType: z.nativeEnum(DeliveryType),
  deliveryValue: z.string().optional()
}).superRefine((data, ctx) => {
  if ((data.deliveryType === DeliveryType.FILE_LINK || data.deliveryType === DeliveryType.WEBHOOK) && !data.deliveryValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["deliveryValue"],
      message: "deliveryValue is required for FILE_LINK or WEBHOOK products"
    });
  }
});

const updateProductSchema = z.object({
  sellerId: z.string().min(1),
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
  priceCents: z.number().int().positive().optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  deliveryValue: z.string().nullable().optional()
});

productsRouter.post("/products", async (req, res, next) => {
  try {
    const input = createProductSchema.parse(req.body);
    const product = await createProductForSeller(input);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

productsRouter.patch("/products/:productId", async (req, res, next) => {
  try {
    const input = updateProductSchema.parse(req.body);
    const product = await updateProductForSeller({
      sellerId: input.sellerId,
      productId: req.params.productId,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
      priceCents: input.priceCents,
      deliveryType: input.deliveryType,
      deliveryValue: input.deliveryValue
    });

    res.json({ success: true, product });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
});

productsRouter.get("/products/guild/:guildId", async (req, res, next) => {
  try {
    const products = await listProductsByGuild(req.params.guildId);
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/products/seller/:sellerId", async (req, res, next) => {
  try {
    const products = await listProductsBySeller(req.params.sellerId);
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});
