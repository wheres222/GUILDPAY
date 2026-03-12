#!/usr/bin/env node
const base = process.env.BASE_URL || "http://127.0.0.1:3000";

async function req(path, method = "GET", body) {
  const r = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: r.ok, status: r.status, json };
}

async function main() {
  console.log("Running e2e mock flow against", base);

  const health = await req("/api/health");
  if (!health.ok) throw new Error(`Health failed: ${health.status}`);

  const setup = await req("/api/setup", "POST", {
    discordGuildId: "e2e-guild",
    guildName: "E2E Guild",
    discordUserId: "seller-e2e"
  });
  if (!setup.ok) throw new Error(`Setup failed: ${setup.status} ${JSON.stringify(setup.json)}`);

  const product = await req("/api/products", "POST", {
    guildId: setup.json.guildId,
    sellerId: setup.json.sellerId,
    name: "E2E Product",
    priceCents: 1999,
    currency: "usd",
    deliveryType: "FILE_LINK",
    deliveryValue: "https://example.com/file.zip"
  });
  if (!product.ok) throw new Error(`Product create failed: ${product.status} ${JSON.stringify(product.json)}`);

  const checkout = await req("/api/checkout/create", "POST", {
    discordGuildId: "e2e-guild",
    sellerDiscordUserId: "seller-e2e",
    buyerDiscordUserId: "buyer-e2e",
    productId: product.json.product.id,
    paymentMethod: "CARD",
    quantity: 1
  });
  if (!checkout.ok) throw new Error(`Checkout failed: ${checkout.status} ${JSON.stringify(checkout.json)}`);

  const completed = await req(`/api/testing/orders/${checkout.json.orderId}/complete`, "POST");
  if (!completed.ok) {
    throw new Error(`Complete order failed: ${completed.status} ${JSON.stringify(completed.json)}`);
  }

  const orders = await req("/api/orders?buyerDiscordUserId=buyer-e2e");
  if (!orders.ok) throw new Error(`Orders failed: ${orders.status} ${JSON.stringify(orders.json)}`);

  const deliveredOrder = orders.json.orders?.find((o) => o.id === checkout.json.orderId);
  if (!deliveredOrder || deliveredOrder.status !== "DELIVERED") {
    throw new Error(`Expected order DELIVERED, got ${JSON.stringify(deliveredOrder)}`);
  }

  const summary = await req(`/api/dashboard/seller/${setup.json.sellerId}/summary`);
  if (!summary.ok) throw new Error(`Summary failed: ${summary.status} ${JSON.stringify(summary.json)}`);

  console.log("E2E mock flow passed", {
    orderId: checkout.json.orderId,
    checkoutUrl: checkout.json.checkoutUrl,
    orderStatus: deliveredOrder.status,
    sellerSummary: summary.json.summary,
    deliveryPayload: completed.json.order?.deliveryPayload
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
