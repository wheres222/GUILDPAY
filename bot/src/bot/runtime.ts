import type { Client } from "discord.js";

let botClient: Client | null = null;

export function setBotClient(client: Client | null) {
  botClient = client;
}

export function getBotClient() {
  return botClient;
}
