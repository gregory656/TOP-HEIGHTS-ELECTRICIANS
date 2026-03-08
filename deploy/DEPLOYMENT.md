# VPS Deployment (React + Vite + Node + Express)

This project deploys without Render. Frontend and backend run on your own VPS.

## Architecture

- Frontend: static files in `/var/www/topheights/frontend`
- Backend: Express API via PM2 on port `3001`
- Reverse proxy: Nginx
  - `topheightselectricals.com` -> frontend
  - `api.topheightselectricals.com` -> Express API

## One-time VPS setup

1. Install tools:
   - `node` (v22)
   - `npm`
   - `pm2` (`npm i -g pm2`)
   - `nginx`
   - `certbot` (for HTTPS)

2. Create folders:
   - `/opt/topheights/app`
   - `/var/www/topheights/frontend`

3. Configure Nginx:
   - Use `deploy/nginx.frontend.conf`
   - Use `deploy/nginx.api.conf`
   - Enable both sites and reload Nginx.

4. Enable HTTPS:
   - Use Certbot for both domains.

## GitHub secrets required

Set these in repository settings:

- `VPS_HOST`
- `VPS_PORT` (optional; default 22)
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_APP_DIR` (example: `/opt/topheights/app`)
- `VPS_FRONTEND_DIR` (example: `/var/www/topheights/frontend`)
- `VITE_CHAT_API_URL` (example: `https://api.topheightselectricals.com`)
- `OPENAI_API_KEY` (optional, if using OpenAI)
- `OPENAI_MODEL` (optional, default `gpt-4o-mini`)
- `FRONTEND_ORIGIN` (example: `https://topheightselectricals.com`)

## Workflows

- `.github/workflows/ci.yml`: validates TypeScript + knowledge generation.
- `.github/workflows/deploy-vps.yml`: deploys on push to `main` (and manual trigger).
