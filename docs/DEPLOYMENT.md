# Deployment Guide

## Overview

Echo Feedback can be deployed to any platform that supports Bun. Recommended platforms:

- **Render** (recommended for simplicity)
- **Fly.io** (recommended for edge deployment)
- **Railway**
- **VPS** (DigitalOcean, AWS, etc.)

---

## Prerequisites

1. **OpenAI API Key** (required)
   - Get from: https://platform.openai.com/api-keys
   - Used for Whisper transcription + GPT classification

2. **ElevenLabs API Key** (optional)
   - Get from: https://elevenlabs.io/
   - Only needed for alternative transcription or TTS features

3. **Database**
   - Option 1: SQLite (default, simple, good for <1K feedback/day)
   - Option 2: Turso (recommended for production, free tier available)

4. **File Storage**
   - Option 1: Local filesystem (default, simple)
   - Option 2: S3-compatible storage (recommended for production)

---

## Deploy to Render

### 1. Create New Web Service

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `echo-feedback-api`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && bun install`
   - **Start Command**: `cd backend && bun run src/index.ts`
   - **Plan**: Free (or Starter for production)

### 2. Environment Variables

Add in Render dashboard:

```bash
OPENAI_API_KEY=sk-...
SUMMARIZER_MODEL=gpt-4o-mini
DATABASE_URL=file:./data.db
WEBHOOK_SECRET=your-random-secret-key

# Optional
ELEVEN_API_KEY=...
PORT=3001
```

### 3. Persistent Storage

For SQLite + uploaded files:

1. Go to your service → "Disks"
2. Add disk:
   - **Name**: `data`
   - **Mount Path**: `/opt/render/project/src/backend/data`
   - **Size**: 10 GB

### 4. Deploy

Click "Create Web Service" - Render will auto-deploy on every git push!

---

## Deploy to Fly.io

### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Create App

```bash
cd backend
fly launch
```

Follow prompts:
- **App name**: `echo-feedback` (or your choice)
- **Region**: Choose closest to your users
- **Postgres**: No (we use SQLite/Turso)

### 3. Configure fly.toml

```toml
app = "echo-feedback"
primary_region = "bos"

[build]
  [build.args]
    BUN_VERSION = "1.0.0"

[env]
  PORT = "8080"
  DATABASE_URL = "/data/db.sqlite"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[mounts]
  source = "data"
  destination = "/data"
```

### 4. Create Volume

```bash
fly volumes create data --size 10 --region bos
```

### 5. Set Secrets

```bash
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set WEBHOOK_SECRET=your-secret
fly secrets set SUMMARIZER_MODEL=gpt-4o-mini
```

### 6. Deploy

```bash
fly deploy
```

---

## Deploy to VPS (DigitalOcean, AWS, etc.)

### 1. Server Setup

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone repo
git clone https://github.com/yourusername/echo-feedback.git
cd echo-feedback/backend

# Install dependencies
bun install
```

### 2. Environment Variables

Create `.env` file:

```bash
OPENAI_API_KEY=sk-...
SUMMARIZER_MODEL=gpt-4o-mini
DATABASE_URL=file:./data.db
WEBHOOK_SECRET=your-secret
PORT=3001
```

### 3. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start "bun run src/index.ts" --name echo-feedback

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
```

### 4. Reverse Proxy (Nginx)

```nginx
server {
  listen 80;
  server_name api.echo-feedback.com;

  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 5. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.echo-feedback.com
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use Turso or managed database instead of SQLite
- [ ] Configure S3 for file storage
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up log aggregation
- [ ] Enable automated backups
- [ ] Configure health check endpoint
- [ ] Set up CI/CD pipeline

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key for Whisper + GPT |
| `SUMMARIZER_MODEL` | No | `gpt-4o-mini` | GPT model for classification |
| `ELEVEN_API_KEY` | No | - | ElevenLabs key (optional) |
| `DATABASE_URL` | No | `./data.db` | SQLite or Turso connection string |
| `WEBHOOK_SECRET` | No | - | HMAC secret for webhooks |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |

---

## Monitoring

### Health Check

```bash
curl https://api.echo-feedback.com/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Logs

```bash
# Render
render logs -s echo-feedback-api

# Fly.io
fly logs

# PM2
pm2 logs echo-feedback
```

---

## Scaling

### Horizontal Scaling

1. Switch to Turso (distributed SQLite)
2. Use S3 for file storage
3. Deploy multiple instances behind load balancer
4. Consider Redis for rate limiting

### Vertical Scaling

Increase resources:
- **Memory**: 512MB → 1GB+ for high traffic
- **CPU**: 1 shared → 2 dedicated for faster transcription

---

## Troubleshooting

### Transcription Fails

- Check `OPENAI_API_KEY` is valid
- Verify audio file is <5MB and <120s
- Check OpenAI API status

### Webhook Delivery Fails

- Verify `webhookUrl` is accessible
- Check HMAC signature verification
- Review webhook logs

### Database Locked

- If using SQLite in production, switch to Turso
- Enable WAL mode: `PRAGMA journal_mode=WAL;`

### Out of Disk Space

- Clean old uploads: `find uploads -mtime +30 -delete`
- Set up S3 storage
- Increase disk size
