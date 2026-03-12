import Stripe from "stripe";
import { env, features } from "../config/env.js";
import { prisma } from "../db/prisma.js";

export const stripe = features.stripeEnabled
  ? new Stripe(env.STRIPE_SECRET_KEY as string)
  : null;

export async function createStripeConnectOnboardingLink(input: {
  sellerId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  const seller = await prisma.seller.findUnique({ where: { id: input.sellerId } });
  if (!seller) throw new Error("Seller not found");

  if (!stripe) {
    return {
      mocked: true,
      accountId: seller.stripeConnectedAccountId || `mock_acct_${input.sellerId}`,
      onboardingUrl: `${env.BASE_URL}/mock/stripe-connect/${input.sellerId}`
    };
  }

  let accountId = seller.stripeConnectedAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express"
    });
    accountId = account.id;

    await prisma.seller.update({
      where: { id: seller.id },
      data: { stripeConnectedAccountId: accountId }
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: input.refreshUrl,
    return_url: input.returnUrl,
    type: "account_onboarding"
  });

  return {
    mocked: false,
    accountId,
    onboardingUrl: accountLink.url
  };
}

export async function createStripeCheckoutSession(input: {
  orderId: string;
  productName: string;
  quantity: number;
  unitAmount: number;
  currency: string;
  platformFeeCents: number;
  sellerStripeAccountId?: string | null;
}) {
  if (!stripe || !input.sellerStripeAccountId) {
    return {
      id: `mock_stripe_${input.orderId}`,
      url: `${env.BASE_URL}/mock/stripe-checkout/${input.orderId}`,
      mocked: true
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: env.STRIPE_SUCCESS_URL,
    cancel_url: env.STRIPE_CANCEL_URL,
    line_items: [
      {
        quantity: input.quantity,
        price_data: {
          currency: input.currency,
          product_data: {
            name: input.productName
          },
          unit_amount: input.unitAmount
        }
      }
    ],
    payment_intent_data: {
      application_fee_amount: input.platformFeeCents,
      transfer_data: {
        destination: input.sellerStripeAccountId
      },
      metadata: {
        orderId: input.orderId
      }
    },
    metadata: {
      orderId: input.orderId,
      provider: "stripe"
    }
  });

  return {
    id: session.id,
    url: session.url || `${env.BASE_URL}/mock/stripe-checkout/${input.orderId}`,
    mocked: false
  };
}
