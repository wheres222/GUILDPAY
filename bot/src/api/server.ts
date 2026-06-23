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
import { discordRouter } from "./routes/discord.js";

export function createApiServer() {
  const app = express();

  app.use("/api/webhooks/nowpayments", express.raw({ type: "application/json" }));

  // CORS — the dashboard calls a few endpoints (e.g. channels list) from the
  // browser, so allow our own web origins (localhost, *.guildpay.io, Vercel).
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (
      origin &&
      (/^http:\/\/localhost:\d+$/.test(origin) ||
        /^https:\/\/([a-z0-9-]+\.)*guildpay\.io$/.test(origin) ||
        /\.vercel\.app$/.test(origin))
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

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
  app.use("/api", discordRouter);
  app.use("/api", webhookRouter);

  app.use(errorHandler);
  return app;
}
