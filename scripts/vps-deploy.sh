#!/usr/bin/env bash
set -euo pipefail

APP_NAME="nfa-alerts"
APP_DIR="/var/www/nfa-alerts"
BRANCH="${1:-main}"
ENV_FILE=".env.production.local"
EXPECTED_PNPM_VERSION="10.33.0"
required_env_keys=(
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
  NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
  # WEB_PUSH_PRIVATE_KEY is optional; server sends use Firebase Admin Messaging.
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  OPENAI_API_KEY
  WEBHOOK_AUTH_TOKEN
  SITE_URL
  NEXT_PUBLIC_GOOGLE_MAP_ID
)

cd "$APP_DIR"

actual_pnpm_version="$(pnpm --version 2>/dev/null || true)"
if [[ -z "$actual_pnpm_version" ]]; then
  echo "Warning: pnpm is not available on PATH. Install pnpm $EXPECTED_PNPM_VERSION before deploy continues." >&2
elif [[ "$actual_pnpm_version" != "$EXPECTED_PNPM_VERSION" ]]; then
  echo "Warning: expected pnpm $EXPECTED_PNPM_VERSION but found $actual_pnpm_version. Continuing deploy." >&2
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $APP_DIR/$ENV_FILE. Create it from .env.production.example before deploying." >&2
  exit 1
fi

if [[ ! -s "$ENV_FILE" ]]; then
  echo "$APP_DIR/$ENV_FILE exists but is empty." >&2
  exit 1
fi

for key in "${required_env_keys[@]}"; do
  if ! grep -Eq "^${key}=.+" "$ENV_FILE"; then
    echo "Missing required key $key in $APP_DIR/$ENV_FILE." >&2
    exit 1
  fi
done

if grep -Eq "^(FIREBASE_SERVICE_ACCOUNT_JSON|GOOGLE_APPLICATION_CREDENTIALS_JSON)=.+" "$ENV_FILE"; then
  :
elif grep -Eq "^FIREBASE_PROJECT_ID=.+" "$ENV_FILE" &&
  grep -Eq "^FIREBASE_CLIENT_EMAIL=.+" "$ENV_FILE" &&
  grep -Eq "^FIREBASE_PRIVATE_KEY=.+" "$ENV_FILE"; then
  :
else
  echo "Missing Firebase Admin credentials in $APP_DIR/$ENV_FILE." >&2
  exit 1
fi

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint:ci
pnpm run test:unit
DOTENV_CONFIG_PATH="$ENV_FILE" node -r dotenv/config scripts/next-build.mjs

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start ecosystem.config.cjs --only "$APP_NAME"
fi
pm2 save
