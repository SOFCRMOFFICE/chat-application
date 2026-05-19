# Vercel Deployment Guide - MTG.in Chatbot

This guide walks you through deploying the MTG.in chatbot to Vercel with serverless functions.

## Quick Deployment (10 minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project" and create a project
3. Copy your project URL and anon key (Settings → API)
4. Run the SQL migration:
   - Open SQL Editor
   - Paste contents of `backend/migrations/001_create_products_table.sql`
   - Execute

### Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Create a new API key
3. Copy it (you'll need it in Vercel)

### Step 3: Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: MTG.in chatbot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mtg-chatbot.git
git push -u origin main
```

### Step 4: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose your GitHub repo
5. Configure environment variables:
   - `SUPABASE_URL` → Your Supabase URL
   - `SUPABASE_ANON_KEY` → Your Supabase anon key
   - `OPENAI_API_KEY` → Your OpenAI API key
   - `CRAWLER_API_KEY` → Generate a random string (e.g., `openssl rand -hex 32`)
   - `NEXT_PUBLIC_API_URL` → Leave blank (will use `/api`)
6. Click "Deploy"
7. Wait 2-3 minutes for deployment to complete

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts and add environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add OPENAI_API_KEY
vercel env add CRAWLER_API_KEY
```

### Step 5: Verify Deployment

1. After deployment, you'll get a URL (e.g., `https://mtg-chatbot.vercel.app`)
2. Test the health check:
   ```
   curl https://your-domain.vercel.app/api/health
   ```
3. Open chatbot in browser:
   ```
   https://your-domain.vercel.app
   ```

## Architecture: Vercel Functions

Your backend is deployed as **serverless functions**:

```
Your Vercel Deployment
├── /api/chat           (POST)  → Chat API
├── /api/products/search (GET)  → Product search
├── /api/crawler/sync   (POST)  → Crawler trigger
├── /api/health         (GET)   → Health check
└── /                   (SSR)   → Next.js frontend
```

Each function:
- Starts fresh on each request
- Has 60 second timeout
- Uses 1024MB memory
- Scales automatically

## Environment Variables

Create these in Vercel Settings → Environment Variables:

| Variable | Value | Where to get |
|----------|-------|--------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase dashboard |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Settings → API |
| `OPENAI_API_KEY` | Your OpenAI API key | OpenAI Platform |
| `CRAWLER_API_KEY` | Random string for crawler auth | Generate yourself |
| `NEXT_PUBLIC_API_URL` | Leave blank or `/api` | Auto-detected |

## First Time Setup Checklist

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] OpenAI API key obtained
- [ ] GitHub repo created and pushed
- [ ] Vercel project connected to GitHub
- [ ] All 4 environment variables added
- [ ] Deployment successful
- [ ] Health check passing
- [ ] Chatbot loads in browser

## Testing Deployment

### Test Health Check
```bash
curl https://your-domain.vercel.app/api/health
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

### Test Chat API
```bash
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are Class 10 books?"}'
```

### Test Product Search
```bash
curl "https://your-domain.vercel.app/api/products/search?q=class%2010"
```

## Running Crawler on Deployment

To index products from MTG.in:

1. Set up the crawler locally first:
   ```bash
   npm run dev:backend
   ```

2. Once working locally, trigger via API:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/crawler/sync \
     -H "Content-Type: application/json" \
     -H "X-API-Key: YOUR_CRAWLER_API_KEY" \
     -d '{
       "urls": ["https://mtg.in/products", "https://mtg.in/books"],
       "maxDepth": 2
     }'
   ```

**Note:** Long crawls may timeout. See "Background Jobs" section below.

## Background Jobs (Scheduled Crawling)

For scheduled product syncs, set up a cron job:

1. **Option A: Use Vercel Cron Functions** (Pro plans)
   - Create `api/cron/sync-products.js`
   - Deploy with Vercel
   - Configure in project settings

2. **Option B: Use External Service** (Free option)
   - Use GitHub Actions
   - Use EasyCron.com
   - Use IFTTT

Example GitHub Actions workflow:
```yaml
# .github/workflows/sync-products.yml
name: Sync Products
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST ${{ secrets.API_URL }}/api/crawler/sync \
            -H "X-API-Key: ${{ secrets.CRAWLER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"urls": ["https://mtg.in"], "maxDepth": 2}'
```

## Troubleshooting

### 1. "500 Internal Server Error" on /api/chat

**Cause:** Missing environment variables

**Fix:**
```bash
# Check Vercel settings
vercel env ls

# Should show:
# SUPABASE_URL
# SUPABASE_ANON_KEY
# OPENAI_API_KEY
# CRAWLER_API_KEY
```

### 2. "Cannot connect to Supabase"

**Cause:** Wrong URL or key

**Fix:**
```bash
# Test connection locally first
npm run dev

# Then verify same credentials in Vercel
vercel env ls
```

### 3. "Timeout: function took too long"

**Cause:** Crawler or search is slow

**Fix:**
- Break crawler into smaller batches
- Run crawler separately (not in chat function)
- Use pagination for search results

### 4. Chat returns "not found" for products

**Cause:** No products indexed

**Fix:**
```bash
# Run crawler first
curl -X POST https://your-domain.vercel.app/api/crawler/sync \
  -H "X-API-Key: YOUR_CRAWLER_API_KEY" \
  -d '{"urls": ["https://mtg.in"]}'

# Check database
# In Supabase, view products table
```

## Monitoring

### Logs
- Vercel Dashboard → Deployments → Function logs
- Real-time logs: `vercel logs`

### Metrics
- Response times
- Error rates
- Cold start duration

### Check logs
```bash
vercel logs https://your-domain.vercel.app/api/chat
```

## Cost Estimates

**Vercel:** $0/month (included in hobby plan) to $20/month
**Supabase:** $25/month
**OpenAI:** $15-50/month (depends on usage)

**Total:** ~$40-95/month

## Scaling

As traffic grows:

1. **Vercel:** Automatically handles scaling
2. **Supabase:** Upgrade plan if needed
3. **OpenAI:** Monitor token usage

## Custom Domain

1. In Vercel dashboard: Settings → Domains
2. Add your domain (e.g., `chatbot.mtg.in`)
3. Update DNS records as instructed
4. Wait for SSL certificate (24-48 hours)

## Git Workflow

Keep your code synced with Vercel:

```bash
# Make changes locally
git add .
git commit -m "Update chatbot"

# Push to GitHub
git push origin main

# Vercel auto-deploys!
```

## Rollback to Previous Version

In Vercel Dashboard:
1. Go to Deployments
2. Find previous working version
3. Click "..." → "Promote to Production"

## Next Steps

- [ ] Deploy to Vercel
- [ ] Test all endpoints
- [ ] Run crawler to index products
- [ ] Share URL with team
- [ ] Monitor performance

## Support

- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- OpenAI docs: https://platform.openai.com/docs

---

**Status:** Ready for production deployment ✅
