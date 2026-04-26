#!/usr/bin/env bash
set -euo pipefail

APP_NAME="nfa-alerts"
APP_DIR="/var/www/nfa-alerts"
BRANCH="${1:-main}"

cd "$APP_DIR"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint:ci
pnpm run test:unit
pnpm run build

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start ecosystem.config.cjs --only "$APP_NAME"
fi
pm2 save
