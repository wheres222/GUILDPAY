import express from "express";
import { checkoutRouter } from "./routes/checkout.js";
import { healthRouter } from "./routes/health.js";
import { webhookRouter } from "./routes/webhook.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { setupRouter } from "./routes/setup.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { payoutsRouter } from "./routes/payouts.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { inventoryRouter } from "./routes/inventory.js";
import { testingRouter } from "./routes/testing.js";
import { discordPanelsRouter } from "./routes/discord-panels.js";

export function createApiServer() {
  const app = express();

  app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));
  app.use("/api/webhooks/nowpayments", express.raw({ type: "application/json" }));

  app.use(express.json());

  app.use("/api", healthRouter);
  app.use("/api", setupRouter);
  app.use("/api", productsRouter);
  app.use("/api", checkoutRouter);
  app.use("/api", ordersRouter);
  app.use("/api", payoutsRouter);
  app.use("/api", dashboardRouter);
  app.use("/api", inventoryRouter);
  app.use("/api", testingRouter);
  app.use("/api", discordPanelsRouter);
  app.use("/api", webhookRouter);

  app.use(errorHandler);
  return app;
}
