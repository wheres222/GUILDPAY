import { readFileSync } from "node:fs";
const channelId = process.argv[2];
const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const token = (env.match(/^DISCORD_TOKEN=(.+)$/m) || [])[1]?.trim();

// label, ticker, custom emoji {name,id}
const coins = [
  ["Bitcoin", "btc", { name: "bitcoin", id: "1516911144001081525" }],
  ["Ethereum", "eth", { name: "ethereum", id: "1516911613980967123" }],
  ["Litecoin", "ltc", { name: "litecoin", id: "1516911166029431016" }],
  ["Solana", "sol", { name: "SolanaPhotoroom", id: "1516911448457085098" }],
  ["USDT", "usdttrc20", { name: "USDTPhotoroom", id: "1516911538277974157" }],
  ["Monero", "xmr", { name: "Monero", id: "1516911185734406168" }],
  ["BNB", "bnbbsc", { name: "BNBPhotoroom", id: "1516911395910848684" }],
];
const EN = String.fromCharCode(0x2002);
const maxLen = Math.max(...coins.map(([l]) => l.length)) + 2;
const pad = (l) => {
  const total = Math.max(0, maxLen - l.length);
  const left = Math.floor(total / 2);
  return EN.repeat(left) + l + EN.repeat(total - left);
};
const rows = [];
for (let i = 0; i < coins.length; i += 2) {
  rows.push({
    type: 1,
    components: coins.slice(i, i + 2).map(([label, value, emoji]) => ({
      type: 2, style: 2, label: pad(label), emoji, custom_id: `paycoin_test:${value}`,
    })),
  });
}
const body = {
  flags: 1 << 15,
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: "## Checkout — Test Product\nAmount: **$29.99 USD**\n\nChoose the crypto you'd like to pay with:" },
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
console.log((await res.text()).slice(0, 250));
