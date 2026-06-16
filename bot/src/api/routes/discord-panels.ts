import { Router } from "express";
import { z } from "zod";
import { postProductBuyPanelByChannelId } from "../../services/discordPanelService.js";

export const discordPanelsRouter = Router();

const createPanelSchema = z.object({
  discordGuildId: z.string().min(1),
  channelId: z.string().min(1),
  sellerDiscordUserId: z.string().min(1),
  productId: z.string().min(1),
  paymentMode: z.enum(["CARD", "CRYPTO", "BOTH"]).optional(),
  note: z.string().max(500).optional(),
  panelTitle: z.string().max(256).optional(),
  panelDescription: z.string().max(1500).optional(),
  imageUrl: z.string().url().optional(),
  cardButtonLabel: z.string().max(80).optional(),
  cryptoButtonLabel: z.string().max(80).optional()
});

discordPanelsRouter.post("/discord/panels/create", async (req, res, next) => {
  try {
    const input = createPanelSchema.parse(req.body);

    const panel = await postProductBuyPanelByChannelId(input);
    res.status(201).json({ success: true, panel });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
});
