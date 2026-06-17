// One-off: post a Components V2 sample message to a channel.
// Usage: node scripts/send-sample-cv2.mjs <channelId>
import { readFileSync } from "node:fs";

const channelId = process.argv[2];
if (!channelId) {
  console.error("Usage: node scripts/send-sample-cv2.mjs <channelId>");
  process.exit(1);
}

// Read DISCORD_TOKEN from .env
const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const token = (env.match(/^DISCORD_TOKEN=(.+)$/m) || [])[1]?.trim();
if (!token) {
  console.error("DISCORD_TOKEN not found in bot/.env");
  process.exit(1);
}

// Components V2 payload (flag 1<<15 = 32768). No content/embeds allowed alongside.
const TEXT_DISPLAY = 10;
const CONTAINER = 17;
const SEPARATOR = 14;

const body = {
  flags: 1 << 15, // IS_COMPONENTS_V2
  components: [
    {
      type: TEXT_DISPLAY,
      content: "**↓ this line is a flat Text Display — no box, no sidebar ↓**",
    },
    {
      type: CONTAINER,
      // accent_color intentionally omitted → no colored sidebar
      components: [
        {
          type: TEXT_DISPLAY,
          content:
            "# 🛒 Sample — Components V2 Container\n" +
            "This box has **no accent color**, so: no colored sidebar, no hard outline, and a faint translucent background — the style you described.",
        },
        { type: SEPARATOR },
        {
          type: TEXT_DISPLAY,
          content:
            "**Price:** `$29.99`  •  **Category:** Digital  •  **Delivery:** Instant key",
        },
      ],
    },
  ],
};

const res = await fetch(
  `https://discord.com/api/v10/channels/${channelId}/messages`,
  {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  },
);

const text = await res.text();
console.log(`HTTP ${res.status}`);
console.log(text.slice(0, 600));
