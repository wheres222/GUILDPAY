// One-off: post a Components V2 message with an uploaded local media file
// (gif/mp4) inside a no-sidebar Container.
// Usage: node scripts/send-sample-media.mjs <channelId> "<path-to-file>"
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";

const channelId = process.argv[2];
const filePath = process.argv[3];
if (!channelId || !filePath) {
  console.error('Usage: node scripts/send-sample-media.mjs <channelId> "<path-to-file>"');
  process.exit(1);
}

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const token = (env.match(/^DISCORD_TOKEN=(.+)$/m) || [])[1]?.trim();
if (!token) {
  console.error("DISCORD_TOKEN not found in bot/.env");
  process.exit(1);
}

const buf = readFileSync(filePath);
const ext = extname(filePath) || ".mp4";
const safeName = "demo" + ext; // Discord dislikes spaces in attachment refs

const TEXT_DISPLAY = 10;
const CONTAINER = 17;
const SEPARATOR = 14;
const MEDIA_GALLERY = 12;

const payload = {
  flags: 1 << 15, // IS_COMPONENTS_V2
  components: [
    {
      type: CONTAINER,
      // accent_color omitted → no colored sidebar
      components: [
        {
          type: TEXT_DISPLAY,
          content:
            "# 🛒 GuildPay — Components V2\nNo sidebar, faint translucent box, with media inside it:",
        },
        { type: MEDIA_GALLERY, items: [{ media: { url: `attachment://${safeName}` } }] },
        { type: SEPARATOR },
        {
          type: TEXT_DISPLAY,
          content: "**Price:** `$29.99`  •  **Category:** Digital  •  Instant delivery",
        },
      ],
    },
  ],
  attachments: [{ id: 0, filename: safeName }],
};

const form = new FormData();
form.append("payload_json", JSON.stringify(payload));
form.append("files[0]", new Blob([buf]), safeName);

const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
  method: "POST",
  headers: { Authorization: `Bot ${token}` }, // let fetch set multipart boundary
  body: form,
});

console.log(`HTTP ${res.status}`);
console.log((await res.text()).slice(0, 700));
