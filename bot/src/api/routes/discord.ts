import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";

export const discordRouter = Router();

const paramsSchema = z.object({
  discordGuildId: z.string().min(1)
});

discordRouter.get("/discord/guild/:discordGuildId/bot-installed", async (req, res, next) => {
  try {
    const { discordGuildId } = paramsSchema.parse(req.params);

    if (!env.DISCORD_TOKEN || !env.DISCORD_CLIENT_ID) {
      return res.status(503).json({
        success: false,
        message: "Discord bot credentials are not configured"
      });
    }

    const botUserId = process.env.DISCORD_BOT_USER_ID || env.DISCORD_CLIENT_ID;

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${discordGuildId}/members/${botUserId}`,
      {
        headers: {
          Authorization: `Bot ${env.DISCORD_TOKEN}`
        }
      }
    );

    if (response.status === 404) {
      return res.json({ success: true, installed: false });
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return res.status(response.status).json({
        success: false,
        message: `Discord API error (${response.status}) ${body.slice(0, 200)}`
      });
    }

    return res.json({ success: true, installed: true });
  } catch (error) {
    next(error);
  }
});
