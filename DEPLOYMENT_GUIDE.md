# Deployment Guide - From Local to Production

This guide walks you through the complete process of deploying your MTG.in chatbot from local development to production.

## Overview

The deployment follows this path:
```
Local Development → GitHub → Vercel → Production Domain
```

## Prerequisites

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Supabase account (for database)
- [ ] OpenAI API key
- [ ] Vercel account (free tier OK)
- [ ] Node.js 18+ installed locally

## Phase 1: Prepare for Production (Local)

### Step 1.1: Verify Local Setup Works

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd mtg-chatbot

# 2. Install dependencies
pnpm install

# 3. Create .env.local from template
cp .env.example .env.local

# 4. Add your local API keys to .env.local
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_key
# OPENAI_API_KEY=your_openai_key
```

### Step 1.2: Run Local Tests

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend (in another terminal)
npm run dev

# Test the chatbot
# Open http://localhost:3000
# Try asking a question
```

### Step 1.3: Initialize Supabase Database

In Supabase dashboard:
1. Create a new project
2. Go to SQL Editor
3. Copy entire contents of `backend/migrations/001_create_products_table.sql`
4. Paste and execute

Verify:
- `products` table created
- `chat_sessions` table created
- `chat_messages` table created
- `products_embeddings` index created

### Step 1.4: Test Data (Optional)

Add test products to verify search works:

```sql
INSERT INTO products (title, description, price, url, category, content)
VALUES (
  'Class 10 Science Book',
  'Comprehensive science preparation',
  '₹299',
  'https://mtg.in/class-10-science',
  'Class 10',
  'Science textbook for CBSE Class 10'
);
```

## Phase 2: Prepare Code for Production

### Step 2.1: Update Configuration Files

Check `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

Check `next.config.mjs`:
```javascript
const nextConfig = {
  reactStrictMode: true,
  // Add any other production configs here
};
```

### Step 2.2: Update Environment Templates

Verify `.env.example` has all required variables:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
OPENAI_API_KEY=
CRAWLER_API_KEY=
```

### Step 2.3: Code Quality Check

```bash
# Run linter
npm run lint

# Check TypeScript
npx tsc --noEmit

# Build for production
npm run build
```

### Step 2.4: Create .gitignore Entries

Ensure `.gitignore` includes:
```
.env
.env.local
.env.*.local
node_modules/
.next/
dist/
```

## Phase 3: Push to GitHub

### Step 3.1: Initialize Git (if not already done)

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: MTG.in chatbot"
git branch -M main
```

### Step 3.2: Connect to GitHub

```bash
# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/mtg-chatbot.git

# Push to GitHub
git push -u origin main
```

### Step 3.3: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/mtg-chatbot
2. Verify all files are present
3. Verify `.env.local` is NOT in the repo (it's in .gitignore)

## Phase 4: Deploy to Vercel

### Step 4.1: Create Vercel Project

Option A: Using Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select "Import Git Repository"
4. Search for your repo: `mtg-chatbot`
5. Click "Import"

Option B: Using CLI
```bash
vercel
# Follow prompts, link to GitHub repo
```

### Step 4.2: Add Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables

Add these variables (one at a time):

| Name | Value | Where to get |
|------|-------|--------------|
| `SUPABASE_URL` | Your Supabase URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Your anon key | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | Your OpenAI key | https://platform.openai.com/account/api-keys |
| `CRAWLER_API_KEY` | Generate random: `openssl rand -hex 32` | Generate yourself |

**Important:** These should be marked as "Production" environment variables.

### Step 4.3: Trigger Deployment

After adding environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete (2-3 minutes)

Or push a small change to auto-trigger:
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

### Step 4.4: Verify Deployment

Once deployment completes:

1. **Test Health Check:**
```bash
curl https://your-deployment.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "api": "online"
  }
}
```

2. **Test Chatbot UI:**
   - Open https://your-deployment.vercel.app in browser
   - Try chatting with the bot

3. **Test API Directly:**
```bash
curl -X POST https://your-deployment.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What books do you have?"}'
```

## Phase 5: Run Crawler in Production

### Step 5.1: Trigger Initial Crawl

```bash
curl -X POST https://your-deployment.vercel.app/api/crawler/sync \
  -H "X-API-Key: YOUR_CRAWLER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://mtg.in"],
    "maxDepth": 2
  }'
```

### Step 5.2: Monitor Crawler Progress

Check Vercel logs:
```bash
vercel logs https://your-deployment.vercel.app/api/crawler/sync --follow
```

Or in Vercel Dashboard:
1. Go to Deployments
2. Click the deployment
3. Go to Function Logs
4. Select `/api/crawler/sync`

### Step 5.3: Verify Products Indexed

Query the health check again:
```bash
curl https://your-deployment.vercel.app/api/health
```

Should show `productsIndexed` count > 0

## Phase 6: Set Up Custom Domain (Optional)

### Step 6.1: Add Domain to Vercel

1. Vercel Dashboard → Project Settings → Domains
2. Enter your domain (e.g., `chatbot.mtg.in`)
3. Click "Add"

### Step 6.2: Configure DNS

Vercel will show DNS records to add:
- Go to your domain registrar (GoDaddy, Namecheap, etc.)
- Add the CNAME records shown in Vercel
- Wait 24-48 hours for DNS propagation

### Step 6.3: Verify SSL

Once DNS propagates:
1. HTTPS should work automatically
2. Check certificate at https://your-domain/

## Phase 7: Set Up Automated Crawler Sync (Optional)

### Using GitHub Actions (Recommended)

Create `.github/workflows/sync-products.yml`:

```yaml
name: Sync MTG Products Daily

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync MTG Products
        run: |
          curl -X POST ${{ secrets.VERCEL_URL }}/api/crawler/sync \
            -H "X-API-Key: ${{ secrets.CRAWLER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "urls": ["https://mtg.in"],
              "maxDepth": 2
            }'
```

Add GitHub Secrets:
1. GitHub Repo → Settings → Secrets and variables
2. Add `VERCEL_URL` → your Vercel deployment URL
3. Add `CRAWLER_API_KEY` → your crawler API key

## Monitoring Production

### Step 1: Enable Error Tracking

In Vercel Dashboard:
1. Go to Settings → Integrations
2. Add Sentry or LogRocket for error tracking

### Step 2: Monitor Performance

Check metrics:
- Response times
- Error rates
- Function duration
- Cold starts

### Step 3: Review Logs

```bash
# Stream logs
vercel logs https://your-deployment.vercel.app --follow

# Filter by endpoint
vercel logs https://your-deployment.vercel.app/api/chat --follow
```

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Verify all environment variables are set
3. Verify package.json has correct build script

### Chat Returns Errors

1. Check `/api/health` endpoint
2. Verify Supabase connection
3. Check Vercel logs for specific error

### Products Not Found

1. Verify crawler was run
2. Check `products` table has data:
   ```bash
   # In Supabase SQL editor
   SELECT COUNT(*) FROM products;
   ```
3. Re-run crawler sync

## Rollback

To revert to a previous deployment:

1. Vercel Dashboard → Deployments
2. Find the working deployment
3. Click "..." → "Promote to Production"

## Success Checklist

- [ ] Health check returns 200
- [ ] Chatbot loads in browser
- [ ] Can send chat messages
- [ ] Products are indexed
- [ ] API endpoints respond
- [ ] Logs show no errors
- [ ] Custom domain (if applicable) works
- [ ] SSL certificate is valid

## Cleanup: Remove Local Backend

Once deployed to Vercel, you can remove the Express server locally:

```bash
# No longer needed - use Vercel Functions instead
rm server.js
```

Keep `backend/` folder for utilities used by Vercel Functions.

## Next Steps

After successful deployment:

1. Share the URL with your team
2. Set up custom domain
3. Configure automated crawler sync
4. Monitor performance and errors
5. Plan Phase 6: WordPress integration

---

**Status:** You now have a production-ready chatbot deployed on Vercel!
