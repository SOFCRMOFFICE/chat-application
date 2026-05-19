# Vercel Deployment Troubleshooting

Quick solutions for common issues when deploying to Vercel.

## Build Issues

### "Build failed: Cannot find module"

**Error:**
```
Error: Cannot find module '@supabase/supabase-js'
```

**Solution:**
```bash
# Make sure dependency is in package.json
pnpm install @supabase/supabase-js

# Commit and push
git add pnpm-lock.yaml
git commit -m "Fix: add missing dependency"
git push origin main

# Vercel will redeploy automatically
```

### "Build timeout"

**Cause:** Taking too long to build

**Solution:**
1. Check Vercel logs for what's slow
2. Reduce build complexity:
   - Remove unused dependencies
   - Optimize images
   - Use dynamic imports

### Build succeeds but functions don't work

**Check:**
1. API files in correct location: `/api/*.js`
2. Functions export default handler
3. All imports are correct

**Fix:**
```bash
# Test locally first
npm run dev:backend

# Then deploy
git push origin main
```

## Runtime Issues

### "500 Internal Server Error" on /api/chat

**Cause:** Environment variable not found

**Fix:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Verify these exist:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
3. Re-deploy:
   - Go to Deployments
   - Click the latest one
   - Click "Redeploy"

### "Cannot POST /api/chat"

**Cause:** 
- Wrong URL
- API not deployed
- CORS issue

**Fix:**
1. Test with curl:
```bash
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

2. Check Vercel logs:
```bash
vercel logs https://your-domain.vercel.app/api/chat
```

3. Verify function exists:
   - Go to Vercel Dashboard → Functions
   - Should see `/api/chat` listed

### "Timeout: function took too long"

**Cause:** Operation exceeds 60 second limit

**Possible culprits:**
- Large crawler job
- Slow database query
- API timeout

**Fix:**
1. For crawler: break into smaller batches
2. For search: optimize vector query
3. For API calls: add timeout

Example:
```javascript
// Add timeout to API calls
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: conversationHistory,
  temperature: 0.7,
  max_tokens: 500,
  timeout: 50000, // 50 second timeout
});
```

## Database Issues

### "Cannot connect to Supabase"

**Check:**
1. Is Supabase project running?
2. Are credentials correct?
3. Is network available?

**Test:**
```bash
# Test in local environment first
SUPABASE_URL=xxx SUPABASE_ANON_KEY=xxx npm run dev

# If it works locally, issue is in Vercel env vars
```

**Fix:**
1. Copy Supabase credentials again from dashboard
2. Update in Vercel settings
3. Re-deploy

### "Table 'products' does not exist"

**Cause:** Migration not run

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire contents of `backend/migrations/001_create_products_table.sql`
3. Paste and execute
4. Verify tables appear in Tables list

### "pgvector not available"

**Cause:** PostgreSQL extension not enabled

**Fix in Supabase:**
1. Go to Dashboard → SQL Editor
2. Run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

3. Verify by running:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## API Issues

### Health check returns unhealthy

**Symptoms:**
```json
{
  "status": "unhealthy",
  "error": "..."
}
```

**Causes and fixes:**

| Error | Fix |
|-------|-----|
| Supabase error | Check SUPABASE_URL/KEY are correct |
| Network error | Check firewall/VPN rules |
| Extension missing | Run `CREATE EXTENSION vector` in Supabase |

### Product search returns empty

**Cause:** No products indexed

**Fix:**
1. Run crawler:
```bash
curl -X POST https://your-domain.vercel.app/api/crawler/sync \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"urls": ["https://mtg.in"], "maxDepth": 1}'
```

2. Check Vercel logs:
```bash
vercel logs https://your-domain.vercel.app/api/crawler/sync
```

3. Check Supabase for data:
   - Go to Table Editor
   - Select `products` table
   - Verify rows exist

### Chat returns "Cannot find products"

**Cause:** Search not working

**Test:**
```bash
# Test search endpoint directly
curl "https://your-domain.vercel.app/api/products/search?q=class%2010"
```

**If empty:**
- Check crawler ran successfully
- Check products table has data
- Check pgvector extension exists

## CORS Issues

### "CORS error: blocked by browser"

**Cause:** Frontend and backend on different domains

**Fix:** Already handled in code, but if you get errors:

In `/api/chat.js` (already there):
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
```

Or for production, restrict to your domain:
```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://your-domain.vercel.app');
```

## Performance Issues

### Slow response times (> 3 seconds)

**Causes:**
1. Cold start (first request after deploy)
2. Slow search query
3. Slow OpenAI response

**Monitor:**
```bash
# Check function duration
vercel logs https://your-domain.vercel.app/api/chat --follow
```

**Optimize:**
1. Keep functions small
2. Cache results
3. Reduce search results limit

### High memory usage

**Fix:**
1. In `vercel.json`, reduce memory:
```json
"functions": {
  "api/**/*.js": {
    "memory": 512
  }
}
```

2. Re-deploy

## Monitoring

### View Real-time Logs

```bash
# All logs
vercel logs https://your-domain.vercel.app --follow

# Specific function
vercel logs https://your-domain.vercel.app/api/chat --follow

# Last 100 lines
vercel logs https://your-domain.vercel.app --lines 100
```

### Check Function Status

```bash
# See all functions
vercel functions list

# Get details
vercel functions describe api/chat
```

## Common Mistakes

### ❌ Committing .env files

```bash
# NEVER do this
git add .env
git commit -m "Add env vars"
git push

# If you did, remove immediately:
git rm --cached .env
git commit -m "Remove env file"
git push
```

### ❌ Using localhost in production code

```javascript
// WRONG in production
const apiUrl = 'http://localhost:3001/api/chat';

// RIGHT - use relative URL
const apiUrl = '/api/chat';
```

### ❌ Forgetting to export handler

```javascript
// WRONG - won't work
async function handler(req, res) {
  // ...
}

// RIGHT
export default async function handler(req, res) {
  // ...
}
```

### ❌ Not using environment variables

```javascript
// WRONG - hardcoded secrets
const apiKey = 'sk-abc123xyz';

// RIGHT - from environment
const apiKey = process.env.OPENAI_API_KEY;
```

## Getting Help

### Check Vercel Status

Go to https://www.vercel-status.com to see if there are outages.

### View Deployment Logs

1. Go to Vercel Dashboard
2. Click Project
3. Go to Deployments
4. Click latest deployment
5. Scroll down to see Function logs
6. Filter by endpoint if needed

### Test Endpoint Directly

Use curl or Postman to test:

```bash
# Test health
curl https://your-domain.vercel.app/api/health

# Test chat
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Test search
curl "https://your-domain.vercel.app/api/products/search?q=books"
```

### Enable Debug Logging

In your Vercel Functions, add debug output:

```javascript
export default async function handler(req, res) {
  console.log('[DEBUG] Request received:', {
    method: req.method,
    path: req.url,
    headers: req.headers,
  });
  
  // ... rest of code
}
```

Then view in Vercel logs:
```bash
vercel logs https://your-domain.vercel.app --follow
```

## Rollback to Previous Version

If new deployment breaks things:

1. Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." menu
4. Select "Promote to Production"

This instantly switches production to the previous version.

## Emergency Procedures

### Something is broken - quick fix

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Promote to production (1 click)
4. Takes effect immediately
5. Fix bug locally
6. Push new version

### Environment variables leaked

1. Rotate all credentials immediately
2. Update in Vercel settings
3. Re-deploy

### Database is down

1. Check Supabase status: https://status.supabase.com
2. If down, API will return 503
3. Nothing to do but wait
4. Check status page for updates

## Success Indicators

Your deployment is working if:

- [ ] Health check returns 200
- [ ] No errors in Vercel logs
- [ ] Response times < 2 seconds
- [ ] Memory usage < 500MB
- [ ] Chatbot works in browser
- [ ] Product search returns results
- [ ] No CORS errors in console

---

**Need more help?**
- Check VERCEL_DEPLOYMENT.md for detailed setup
- Check DEPLOYMENT_GUIDE.md for step-by-step instructions
- Visit https://vercel.com/docs for official Vercel docs
