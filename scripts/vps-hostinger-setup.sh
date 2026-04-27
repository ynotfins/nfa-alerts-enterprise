#!/usr/bin/env bash
set -euo pipefail

APP_NAME="nfa-alerts"
APP_DIR="/var/www/nfa-alerts"
APP_USER="nfa"
DOMAIN="${1:-}"
REPO_URL="https://github.com/ynotfins/nfa-alerts-enterprise.git"
NODE_MAJOR="22"
PNPM_VERSION="10.33.0"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/vps-hostinger-setup.sh your-domain.example" >&2
  exit 1
fi

if [[ -z "$DOMAIN" ]]; then
  read -r -p "Domain for nginx server_name: " DOMAIN
fi

if [[ -z "$DOMAIN" ]]; then
  echo "Domain is required." >&2
  exit 2
fi

if [[ "$DOMAIN" == "your-domain.example" || "$DOMAIN" == "example.com" || "$DOMAIN" == "localhost" ]]; then
  echo "Refusing placeholder nginx server_name: $DOMAIN" >&2
  echo "Pass the real DNS name that points to this VPS." >&2
  exit 2
fi

apt-get update
apt-get install -y ca-certificates curl gnupg git nginx ufw

install -d -m 0755 /etc/apt/keyrings
curl -fsSL "https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key" | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
apt-get update
apt-get install -y nodejs

corepack enable
corepack prepare "pnpm@$PNPM_VERSION" --activate
npm install -g pm2

if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "$APP_USER"
fi

mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"

if [[ ! -d "$APP_DIR/.git" ]]; then
  sudo -u "$APP_USER" git clone "$REPO_URL" "$APP_DIR"
fi

cat > "/etc/nginx/sites-available/$APP_NAME" <<NGINX
server {
    listen 80;
    listen [::]:80;
    # Replace by rerunning this script if DNS changes; do not deploy with a placeholder.
    server_name $DOMAIN;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sfn "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/$APP_NAME"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

cat > "$APP_DIR/ecosystem.config.cjs" <<PM2
module.exports = {
  apps: [
    {
      name: "$APP_NAME",
      cwd: "$APP_DIR",
      script: "node",
      args: "-r dotenv/config node_modules/next/dist/bin/next start",
      env: {
        DOTENV_CONFIG_PATH: ".env.production.local",
        NODE_ENV: "production",
        PORT: "3000"
      },
      max_memory_restart: "512M",
      autorestart: true
    }
  ]
};
PM2
chown "$APP_USER:$APP_USER" "$APP_DIR/ecosystem.config.cjs"

cat > "$APP_DIR/.env.production.example" <<ENV
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=
WEBHOOK_AUTH_TOKEN=
SITE_URL=
NEXT_PUBLIC_GOOGLE_MAP_ID=
CONTEXT7_SECRET_KEY=
PORT=3000
ENV
chown "$APP_USER:$APP_USER" "$APP_DIR/.env.production.example"

if [[ ! -f "$APP_DIR/.env.production.local" ]]; then
  install -m 0600 -o "$APP_USER" -g "$APP_USER" /dev/null "$APP_DIR/.env.production.local"
fi

echo "Base VPS setup complete."
echo "Next:"
echo "1. Securely edit $APP_DIR/.env.production.local and add real runtime variables before deploying."
echo "2. Deploy with: sudo -u $APP_USER bash $APP_DIR/scripts/vps-deploy.sh"
echo "3. Enable HTTPS with certbot after DNS points $DOMAIN to this server."
