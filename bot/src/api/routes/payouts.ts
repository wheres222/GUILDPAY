import { Router } from "express";
import { z } from "zod";
import { listPayoutRequestsBySeller, requestCryptoPayout } from "../../services/orderService.js";

export const payoutsRouter = Router();

const requestSchema = z.object({
  sellerId: z.string().min(1),
  amountCents: z.number().int().positive(),
  walletAddress: z.string().min(8),
  currency: z.string().default("usd")
});

const listSchema = z.object({
  sellerId: z.string().min(1),
  limit: z.coerce.number().int().positive().optional()
});

payoutsRouter.get("/payouts/crypto/requests", async (req, res, next) => {
  try {
    const input = listSchema.parse(req.query);
    const payouts = await listPayoutRequestsBySeller(input);
    res.json({ success: true, payouts });
  } catch (error) {
    next(error);
  }
});

payoutsRouter.post("/payouts/crypto/request", async (req, res, next) => {
  try {
    const input = requestSchema.parse(req.body);
    const payout = await requestCryptoPayout(input);
    res.status(201).json({ success: true, payout });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
});
