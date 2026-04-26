# Hostinger VPS Deployment

Target: fresh Ubuntu VPS running this Next.js app behind nginx and PM2.

## Server setup

Run once as a sudo-capable user:

```bash
curl -fsSL https://raw.githubusercontent.com/ynotfins/nfa-alerts-enterprise/main/scripts/vps-hostinger-setup.sh -o /tmp/nfa-vps-setup.sh
read -r -p "Domain for this app: " APP_DOMAIN
sudo bash /tmp/nfa-vps-setup.sh "$APP_DOMAIN"
```

The script installs Node.js LTS, pnpm, nginx, PM2, UFW, creates `/var/www/nfa-alerts`, and configures nginx to proxy to `127.0.0.1:3000`.

The nginx `server_name` is set from the domain entered at setup time. If DNS is not ready, enter the intended production domain and point DNS before enabling HTTPS.

## Runtime environment

Create the runtime environment file without printing values. The setup script writes `.env.production.example` beside the app; copy its structure, then enter real values manually or from a secret manager.

```bash
sudo -u nfa bash
cd /var/www/nfa-alerts
umask 077
cp .env.production.example .env.production.local
nano .env.production.local
chmod 600 .env.production.local
exit
```

Required keys are listed in `docs/ai/CLOUD_AGENTS.md`. Do not set `NODE_ENV`; `pnpm run start` forces production mode.

Example structure only:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
FIREBASE_SERVICE_ACCOUNT_JSON=
GOOGLE_APPLICATION_CREDENTIALS_JSON=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_GOOGLE_MAP_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
OPENAI_API_KEY=
WEBHOOK_AUTH_TOKEN=
PORT=3000
```

Do not commit `.env.production.local`, paste it into logs, or screenshot it.

Build and start:

```bash
sudo -u nfa bash /var/www/nfa-alerts/scripts/vps-deploy.sh
```

## Update deployment

```bash
sudo -u nfa bash /var/www/nfa-alerts/scripts/vps-deploy.sh
```

## Logs and health

```bash
pm2 status
pm2 logs nfa-alerts --lines 100
curl -i http://127.0.0.1:3000/login
curl -i "https://$APP_DOMAIN/login"
sudo nginx -t
sudo journalctl -u nginx -n 100 --no-pager
```

## Runtime policy

- Default app port is `3000`.
- Use `PORT=3001 pnpm run start` only when `3000` is already occupied.
- `package.json` pins the package manager; `scripts/vps-deploy.sh` warns if the installed pnpm version differs.
- Keep secrets in `.env.production.local` on the VPS or in a provider secret store; never commit `.env.production.local`.
- `scripts/vps-deploy.sh` preloads `.env.production.local` for `pnpm run build`, so public Firebase keys are embedded into the production client bundle from the VPS env file.
- PM2 starts Next.js through `node -r dotenv/config ...` with `DOTENV_CONFIG_PATH=.env.production.local`, so runtime Firebase/API keys are loaded by the production process.
- `scripts/vps-deploy.sh` fails before build/restart if `.env.production.local` is missing or required runtime keys are empty.
- Rotate Firebase Admin keys if any server secret is exposed.
