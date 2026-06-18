import { readFileSync } from "node:fs";
const channelId = process.argv[2];
const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const token = (env.match(/^DISCORD_TOKEN=(.+)$/m) || [])[1]?.trim();

const coins = [
  ["btc", { name: "bitcoin", id: "1516911144001081525" }],
  ["eth", { name: "ethereum", id: "1516911613980967123" }],
  ["ltc", { name: "litecoin", id: "1516911166029431016" }],
  ["sol", { name: "SolanaPhotoroom", id: "1516911448457085098" }],
  ["usdttrc20", { name: "USDTPhotoroom", id: "1516911538277974157" }],
  ["xmr", { name: "Monero", id: "1516911185734406168" }],
  ["bnbbsc", { name: "BNBPhotoroom", id: "1516911395910848684" }],
];
const rows = [];
for (let i = 0; i < coins.length; i += 4) {
  rows.push({
    type: 1,
    components: coins.slice(i, i + 4).map(([value, emoji]) => ({
      type: 2, style: 2, emoji, custom_id: `paycoin_test:${value}`,
    })),
  });
}
const body = {
  flags: 1 << 15,
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: "## Emoji-only picker (perfectly even)\nTap a coin to pay:" },
        ...rows,
      ],
    },
  ],
};
const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
  method: "POST",
  headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
console.log(`HTTP ${res.status}`);
console.log((await res.text()).slice(0, 200));
