import { Router } from "express";
import { z } from "zod";
import { PLAN_CONFIG } from "../../config/plans.js";
import { setSellerConnections, upsertGuildAndSeller } from "../../services/sellerService.js";
import { createStripeConnectOnboardingLink } from "../../services/stripeService.js";

export const setupRouter = Router();

const setupSchema = z.object({
  discordGuildId: z.string().min(1),
  guildName: z.string().optional(),
  discordUserId: z.string().min(1)
});

const connectSchema = z.object({
  sellerId: z.string().min(1),
  stripeConnectedAccountId: z.string().optional(),
  cryptoPayoutAddress: z.string().optional(),
  webhookDeliveryUrl: z.string().url().optional(),
  webhookDeliverySecret: z.string().optional()
});

const stripeLinkSchema = z.object({
  sellerId: z.string().min(1),
  refreshUrl: z.string().url(),
  returnUrl: z.string().url()
});

setupRouter.post("/setup", async (req, res, next) => {
  try {
    const input = setupSchema.parse(req.body);
    const result = await upsertGuildAndSeller(input);

    res.status(201).json({
      success: true,
      guildId: result.guild.id,
      sellerId: result.seller.id,
      plan: PLAN_CONFIG[result.seller.planTier]
    });
  } catch (error) {
    next(error);
  }
});

setupRouter.post("/setup/connect", async (req, res, next) => {
  try {
    const input = connectSchema.parse(req.body);
    const seller = await setSellerConnections(input);
    res.json({ success: true, seller });
  } catch (error) {
    next(error);
  }
});

setupRouter.post("/setup/connect/stripe/link", async (req, res, next) => {
  try {
    const input = stripeLinkSchema.parse(req.body);
    const onboarding = await createStripeConnectOnboardingLink(input);
    res.json({ success: true, onboarding });
  } catch (error) {
    next(error);
  }
});
