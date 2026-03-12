#!/usr/bin/env node
const base = process.env.BASE_URL || "http://127.0.0.1:3000";

async function post(path, body) {
  const r = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`${path} ${r.status} ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  const setup = await post("/api/setup", {
    discordGuildId: "seed-guild-1",
    guildName: "Seed Guild",
    discordUserId: "seed-seller-1"
  });

  const productA = await post("/api/products", {
    guildId: setup.guildId,
    sellerId: setup.sellerId,
    name: "Seed License Product",
    description: "Auto license key delivery",
    priceCents: 1500,
    currency: "usd",
    deliveryType: "LICENSE_KEY"
  });

  const productB = await post("/api/products", {
    guildId: setup.guildId,
    sellerId: setup.sellerId,
    name: "Seed File Product",
    description: "File link delivery",
    priceCents: 2500,
    currency: "usd",
    deliveryType: "FILE_LINK",
    deliveryValue: "https://example.com/download.zip"
  });

  console.log("Seed complete", {
    guildId: setup.guildId,
    sellerId: setup.sellerId,
    products: [productA.product.id, productB.product.id]
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
