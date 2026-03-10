# GUILDPAY Frontend

Next.js frontend for Guild Pay (Discord commerce bot).

## Current status
- Marketing pages ready
- Dashboard UI shell ready
- Auth/API wiring pending (next phase)

## Setup
```bash
cp .env.example .env.local
npm install
npm run dev
```

## Commands
```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Notes
- API integration is intentionally deferred to next phase.
- `NEXT_PUBLIC_DISCORD_INVITE_URL` controls all "Add to Discord" buttons.
