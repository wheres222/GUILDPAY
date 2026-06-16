import { env, features } from "./config/env.js";
import { createApiServer } from "./api/server.js";
import { registerCommands } from "./bot/commands/register.js";
import { startBot } from "./bot/client.js";
import { prisma } from "./db/prisma.js";

async function main() {
  const app = createApiServer();

  app.listen(env.PORT, () => {
    console.log(`API listening on :${env.PORT}`);
    console.log(`Features => discord:${features.discordEnabled} stripe:${features.stripeEnabled} nowpayments:${features.nowPaymentsEnabled}`);
  });

  await registerCommands();
  await startBot();
}

main().catch(async (err) => {
  console.error("Fatal startup error", err);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
