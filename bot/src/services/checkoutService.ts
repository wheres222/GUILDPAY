import { PaymentMethod, PaymentProvider } from "@prisma/client";
import { env } from "../config/env.js";
import { createNowPaymentInvoice } from "./nowPaymentsService.js";
import { createOrderForVariant, setOrderCheckoutReference } from "./orderService.js";
import { createStripeCheckoutSession } from "./stripeService.js";

export async function createCheckoutForVariant(input: {
  guildId: string;
  sellerId: string;
  buyerDiscordUserId: string;
  variantId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  productName: string;
  sellerStripeAccountId?: string | null;
}) {
  const provider: PaymentProvider =
    input.paymentMethod === PaymentMethod.CARD ? PaymentProvider.STRIPE : PaymentProvider.NOWPAYMENTS;

  const order = await createOrderForVariant({
    guildId: input.guildId,
    sellerId: input.sellerId,
    buyerDiscordUserId: input.buyerDiscordUserId,
    variantId: input.variantId,
    quantity: input.quantity,
    paymentMethod: input.paymentMethod,
    paymentProvider: provider
  });

  const item = order.items[0];

  if (provider === PaymentProvider.STRIPE) {
    const session = await createStripeCheckoutSession({
      orderId: order.id,
      productName: item.productName,
      quantity: item.quantity,
      unitAmount: item.unitPriceCents,
      currency: order.currency,
      platformFeeCents: order.platformFeeCents,
      sellerStripeAccountId: input.sellerStripeAccountId
    });

    await setOrderCheckoutReference({
      orderId: order.id,
      checkoutUrl: session.url,
      paymentReference: session.id
    });

    return {
      orderId: order.id,
      checkoutUrl: session.url,
      paymentReference: session.id,
      mocked: session.mocked,
      provider
    };
  }

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
    provider
  };
}
