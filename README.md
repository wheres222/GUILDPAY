# GUILDPAY Monorepo

This repo now contains both:
- `./` → **Frontend** (Next.js, Vercel)
- `./backend` → **Backend** (Discord bot + API)

## Frontend (Vercel)

### Setup
```bash
cp .env.example .env.local
npm install
npm run dev
```

### Required env (frontend)
- `AUTH_SECRET`
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `NEXT_PUBLIC_DISCORD_INVITE_URL`
- `NEXT_PUBLIC_API_BASE_URL` (for production: `https://api.guildpay.io/api`)

### Commands
```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Backend (`/backend`)

### Setup
```bash
cd backend
cp .env.example .env
npm ci
npm run prisma:generate
npm run prisma:push
npm run build
npm start
```

### Required env (backend)
- `BASE_URL`
- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`
- `DATABASE_URL`

### Core API routes
- `GET /api/health`
- `POST /api/setup`
- `POST /api/products`
- `PATCH /api/products/:productId`
- `POST /api/discord/panels/create`
- `POST /api/checkout/create`
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/nowpayments`
- `GET /api/webhooks/events`
- `GET /api/dashboard/seller/:sellerId/*`
- `GET /api/inventory/seller/:sellerId/summary`
- `POST /api/payouts/crypto/request`
- `GET /api/payouts/crypto/requests`

## Notes
- Frontend is hosted on Vercel.
- Backend is intended to run on a VPS and be exposed at `api.guildpay.io`.
- Payments are verified by webhooks before delivery.
