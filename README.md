# GUILDPAY Frontend

Next.js frontend for Guild Pay (Discord commerce bot).

## Current status
- Marketing pages ready
- Dashboard UI shell ready
- Discord OAuth sign-in + protected routes scaffolded
- Guild selector wired to live Discord-managed guilds
- API wiring still partial (core integration next)

## Setup
```bash
cp .env.example .env.local
npm install
npm run dev
```

### Minimum env for auth flow
- `AUTH_SECRET`
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `NEXT_PUBLIC_DISCORD_INVITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`

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
