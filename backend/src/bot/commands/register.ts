import { REST, Routes } from "discord.js";
import { env, features } from "../../config/env.js";
import { commandDefinitions } from "./definitions.js";

export async function registerCommands() {
  if (!features.discordEnabled || !env.DISCORD_TOKEN || !env.DISCORD_CLIENT_ID) {
    console.log("Discord commands skipped: DISCORD_TOKEN / DISCORD_CLIENT_ID not configured yet.");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  const route = env.DISCORD_GUILD_ID
    ? Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID)
    : Routes.applicationCommands(env.DISCORD_CLIENT_ID);

  await rest.put(route, { body: commandDefinitions });
  console.log("Discord slash commands registered.");
}
