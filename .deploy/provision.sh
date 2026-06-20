#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a
export NEEDRESTART_SUSPEND=1

echo "==> apt update"
apt-get update -qq

echo "==> base packages"
apt-get install -y -qq ca-certificates curl gnupg git build-essential ufw nginx >/dev/null

echo "==> NodeSource Node 22"
if ! command -v node >/dev/null || [ "$(node -v | cut -dv -f2 | cut -d. -f1)" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs >/dev/null
fi

echo "==> certbot (snap)"
if ! command -v certbot >/dev/null; then
  apt-get install -y -qq certbot python3-certbot-nginx >/dev/null
fi

echo "==> pm2"
npm install -g pm2 >/dev/null 2>&1

echo "==> firewall"
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 80/tcp >/dev/null 2>&1 || true
ufw allow 443/tcp >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true

echo "==== VERSIONS ===="
echo "node $(node -v)"
echo "npm  $(npm -v)"
echo "git  $(git --version | awk '{print $3}')"
echo "nginx $(nginx -v 2>&1 | awk -F/ '{print $2}')"
echo "certbot $(certbot --version 2>&1 | awk '{print $2}')"
echo "pm2 $(pm2 -v)"
echo "==== DONE ===="
