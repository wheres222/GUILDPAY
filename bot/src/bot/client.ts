import { Client, Events, GatewayIntentBits, Interaction } from "discord.js";
import { env, features } from "../config/env.js";
import { handleButtonInteraction, handleInteraction } from "./handlers/interactionCreate.js";
import { setBotClient } from "./runtime.js";

export async function startBot() {
  if (!features.discordEnabled || !env.DISCORD_TOKEN) {
    setBotClient(null);
    console.log("Discord bot login skipped: DISCORD_TOKEN / DISCORD_CLIENT_ID not configured.");
    return null;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages]
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord bot ready as ${readyClient.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        await handleInteraction(interaction);
        return;
      }

      if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
      }
    } catch (error) {
      console.error("Interaction handler error", error);
      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: "Something went wrong.", ephemeral: true });
        } else {
          await interaction.reply({ content: "Something went wrong.", ephemeral: true });
        }
      }
    }
  });

  await client.login(env.DISCORD_TOKEN);
  setBotClient(client);
  return client;
}
