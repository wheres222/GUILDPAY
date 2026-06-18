import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const token = (env.match(/^DISCORD_TOKEN=(.+)$/m) || [])[1]?.trim();
const guildId = (env.match(/^DISCORD_GUILD_ID=(.+)$/m) || [])[1]?.trim();

const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/emojis`, {
  headers: { Authorization: `Bot ${token}` },
});
console.log(`HTTP ${res.status}`);
const emojis = await res.json();
if (Array.isArray(emojis)) {
  for (const e of emojis) {
    const ref = e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`;
    console.log(`${e.name}\t${ref}`);
  }
} else {
  console.log(JSON.stringify(emojis).slice(0, 300));
}
