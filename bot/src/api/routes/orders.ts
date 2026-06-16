import { Router } from "express";
import { z } from "zod";
import { listOrdersByUser } from "../../services/orderService.js";

export const ordersRouter = Router();

const querySchema = z.object({
  buyerDiscordUserId: z.string().min(1)
});

ordersRouter.get("/orders", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const orders = await listOrdersByUser(query.buyerDiscordUserId);
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});
