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

## Runtime environment

Create the runtime environment file without printing values:

```bash
sudo -u nfa bash
cd /var/www/nfa-alerts
umask 077
nano .env.production.local
exit
```

Required keys are listed in `docs/ai/CLOUD_AGENTS.md`. Do not set `NODE_ENV`; `pnpm run start` forces production mode.

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
- Keep secrets in `.env.production.local` on the VPS or in a provider secret store; never commit `.env.production.local`.
- `scripts/vps-deploy.sh` exports `.env.production.local` only for the PM2 child process and never prints values.
- Rotate Firebase Admin keys if any server secret is exposed.
