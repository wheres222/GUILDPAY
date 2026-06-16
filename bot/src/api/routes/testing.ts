import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { deliverOrder } from "../../services/deliveryService.js";
import { markOrderPaid } from "../../services/orderService.js";

export const testingRouter = Router();

const completeSchema = z.object({
  orderId: z.string().min(1)
});

testingRouter.post("/testing/orders/:orderId/complete", async (req, res, next) => {
  if (env.NODE_ENV === "production") {
    return res.status(403).json({ success: false, message: "Testing endpoints disabled in production" });
  }

  try {
    const { orderId } = completeSchema.parse(req.params);

    await markOrderPaid(orderId);
    const delivered = await deliverOrder(orderId);

    const order = await prisma.order.findUnique({
      where: { id: delivered.id },
      include: { items: true }
    });

    return res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});
