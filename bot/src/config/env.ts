import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),
  BASE_URL: z.string().url().default("http://localhost:3000"),

  DISCORD_TOKEN: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_GUILD_ID: z.string().optional(),

  NOWPAYMENTS_API_KEY: z.string().optional(),
  NOWPAYMENTS_IPN_SECRET: z.string().optional(),
  NOWPAYMENTS_BASE_URL: z.string().default("https://api.nowpayments.io/v1"),
  NOWPAYMENTS_PAY_CURRENCY: z.string().default("usdttrc20"),

  DATABASE_URL: z.string().default("file:./prisma/dev.db")
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const features = {
  discordEnabled: Boolean(env.DISCORD_TOKEN && env.DISCORD_CLIENT_ID),
  nowPaymentsEnabled: Boolean(env.NOWPAYMENTS_API_KEY)
};
