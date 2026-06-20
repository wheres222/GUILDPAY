#!/usr/bin/env bash
# One-command redeploy for the GuildPay bot on the VPS.
# Usage (on the server):  bash /root/guildpay/.deploy/update.sh
set -euo pipefail

REPO=/root/guildpay
BOT="$REPO/bot"

echo "==> git pull"
cd "$REPO"
git pull --ff-only

echo "==> install deps"
cd "$BOT"
npm ci --no-audit --no-fund

echo "==> prisma generate + db push"
npx prisma generate
npx prisma db push --skip-generate

echo "==> build"
npm run build

echo "==> restart pm2"
pm2 restart guildpay-bot --update-env
pm2 save

echo "==> health"
sleep 2
curl -s --resolve bot.guildpay.io:443:127.0.0.1 -o /dev/null -w "local health -> HTTP %{http_code}\n" https://bot.guildpay.io/api/health || true
echo "==> DONE"
