# Discord Commerce Bot (MVP + Phase 2 Scaffold)

Discord-native multi-seller commerce bot with:
- Tiered platform fees
- Stripe Connect card checkout
- NOWPayments crypto checkout
- Paid-only delivery pipeline
- Idempotent webhooks
- Seller dashboard summary endpoints
- Replay/seed/e2e scripts

## Pricing / Tier Rules
- **FREE**: 3% fee
- **PRO**: 1.5% fee, $19/mo
- **ENTERPRISE**: 0% fee, $99/mo

## Delivery Types (MVP)
- `LICENSE_KEY`
- `FILE_LINK`
- `WEBHOOK`

> Manual fallback delivery intentionally deferred. See: `ops/discord-commerce-bot-backlog.md`

## Bot Commands
- `/setup`
- `/stripe_connect`
- `/product_create`
- `/product_list`
- `/panel_create`
- `/license_add`
- `/shop`
- `/buy`
- `/orders`
- `/payout_request`

## API Routes
### Core
- `GET /api/health`
- `POST /api/setup`
- `POST /api/setup/connect`
- `POST /api/setup/connect/stripe/link`

### Products / Checkout / Orders
- `POST /api/products`
- `GET /api/products/guild/:guildId`
- `GET /api/products/seller/:sellerId`
- `POST /api/checkout/create`
- `GET /api/orders?buyerDiscordUserId=...`

### Seller Finance / Dashboard
- `POST /api/payouts/crypto/request`
- `GET /api/dashboard/seller/:sellerId/summary`
- `GET /api/dashboard/seller/:sellerId/orders`
- `POST /api/inventory/license-keys/bulk`
- `POST /api/discord/panels/create`

### Testing (non-production only)
- `POST /api/testing/orders/:orderId/complete`

### Webhooks
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/nowpayments`

## Order State Machine
`CREATED -> PENDING_PAYMENT -> PAID -> DELIVERY_PENDING -> DELIVERED`

Failure paths:
- `PENDING_PAYMENT -> FAILED|CANCELLED`
- `DELIVERED -> REFUNDED`

Delivery fires **only after paid confirmation**.

## Webhook Structure Plan
See: `ops/discord-commerce-webhook-structures.md`

## Environment
Copy `.env.example` to `.env` and fill keys when ready:

```bash
cp .env.example .env
```

- Discord keys (required for live bot)
- Stripe keys (required for card)
- NOWPayments keys (required for crypto)
- `DATABASE_URL` (defaults to local sqlite)

## Local Run
```bash
npm install
npx prisma generate
DATABASE_URL='file:./prisma/dev.db' npx prisma db push
npm run build
npm run dev
```

## Helper Scripts
- `npm run seed` — create sample guild/seller/products via API
- `npm run e2e:mock` — run mock end-to-end flow against local API
- `npm run webhook:replay -- nowpayments <orderId>`
- `npm run webhook:replay -- stripe <orderId>`

## Notes
- In scaffold mode (no provider keys), checkout links are mocked so flow can still be tested.
- `/panel_create` posts persistent Buy buttons in channels; checkout links are private (ephemeral) and delivery updates are sent privately by DM.
- Move from SQLite to Postgres before production launch.
- Add auth/permissions middleware before opening seller dashboard routes publicly.
