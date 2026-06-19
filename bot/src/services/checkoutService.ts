import { PaymentMethod, PaymentProvider } from "@prisma/client";
import { env } from "../config/env.js";
import { createNowPaymentInvoice } from "./nowPaymentsService.js";
import { createOrderForVariant, setOrderCheckoutReference } from "./orderService.js";

export async function createCheckoutForVariant(input: {
  guildId: string;
  sellerId: string;
  buyerDiscordUserId: string;
  variantId: string;
  quantity: number;
  productName: string;
}) {
  const order = await createOrderForVariant({
    guildId: input.guildId,
    sellerId: input.sellerId,
    buyerDiscordUserId: input.buyerDiscordUserId,
    variantId: input.variantId,
    quantity: input.quantity,
    paymentMethod: PaymentMethod.CRYPTO,
    paymentProvider: PaymentProvider.NOWPAYMENTS
  });

  const item = order.items[0];

  const invoice = await createNowPaymentInvoice({
    orderId: order.id,
    amountUsd: order.subtotalCents / 100,
    description: `${item.productName} x${item.quantity}`,
    ipnCallbackUrl: `${env.BASE_URL}/api/webhooks/nowpayments`
  });

  await setOrderCheckoutReference({
    orderId: order.id,
    checkoutUrl: invoice.url,
    paymentReference: invoice.id
  });

  return {
    orderId: order.id,
    checkoutUrl: invoice.url,
    paymentReference: invoice.id,
    mocked: invoice.mocked,
    provider: PaymentProvider.NOWPAYMENTS
  };
}
