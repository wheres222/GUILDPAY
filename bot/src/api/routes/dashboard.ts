import { OrderStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { sellerOrders, sellerProfile, sellerRiskMetrics, sellerSummary } from "../../services/dashboardService.js";

export const dashboardRouter = Router();

const sellerParamsSchema = z.object({
  sellerId: z.string().min(1)
});

const ordersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  status: z.string().optional()
});

dashboardRouter.get("/dashboard/seller/:sellerId/summary", async (req, res, next) => {
  try {
    const { sellerId } = sellerParamsSchema.parse(req.params);
    const summary = await sellerSummary(sellerId);
    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/dashboard/seller/:sellerId/orders", async (req, res, next) => {
  try {
    const { sellerId } = sellerParamsSchema.parse(req.params);
    const { limit, status } = ordersQuerySchema.parse(req.query);

    const statuses = status
      ? status
          .split(",")
          .map((value) => value.trim().toUpperCase())
          .filter((value): value is OrderStatus =>
            (Object.values(OrderStatus) as string[]).includes(value)
          )
      : undefined;

    const orders = await sellerOrders(sellerId, limit, statuses);
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/dashboard/seller/:sellerId/profile", async (req, res, next) => {
  try {
    const { sellerId } = sellerParamsSchema.parse(req.params);
    const profile = await sellerProfile(sellerId);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/dashboard/seller/:sellerId/risk", async (req, res, next) => {
  try {
    const { sellerId } = sellerParamsSchema.parse(req.params);
    const risk = await sellerRiskMetrics(sellerId);
    res.json({ success: true, risk });
  } catch (error) {
    next(error);
  }
});
