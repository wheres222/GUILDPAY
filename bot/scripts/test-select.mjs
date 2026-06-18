import { readFileSync } from "node:fs";
const channelId = process.argv[2];
const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const token = (env.match(/^DISCORD_TOKEN=(.+)$/m) || [])[1]?.trim();

const body = {
  flags: 1 << 15,
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: "## Checkout — Test Product\nAmount: **$29.99 USD**\n\nChoose the crypto you'd like to pay with:" },
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: "paycoin_test",
              placeholder: "Select a coin",
              options: [
                { label: "Bitcoin", value: "btc", description: "BTC" },
                { label: "USDT (TRC-20)", value: "usdttrc20", description: "Low fees" },
                { label: "Ethereum", value: "eth", description: "ETH" },
              ],
            },
          ],
        },
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
console.log((await res.text()).slice(0, 400));
