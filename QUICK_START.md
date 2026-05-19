# Quick Start Guide - 5 Minutes to Running

## TL;DR

```bash
# 1. Clone and install
git clone <repo>
cd mtg-chatbot
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Create database
# Go to Supabase dashboard → SQL Editor
# Run: backend/migrations/001_create_products_table.sql

# 4. Start both servers
npm run dev:backend &
npm run dev

# 5. Open browser
open http://localhost:3000
```

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] OpenAI API key obtained
- [ ] pnpm installed

## Step-by-Step Setup

### 1. Get Your API Keys (2 min)

**Supabase:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy `Project URL` and `anon key`

**OpenAI:**
1. Go to [platform.openai.com](https://platform.openai.com/account/api-keys)
2. Create new secret key
3. Copy the key

### 2. Clone & Install (1 min)

```bash
git clone <repository-url>
cd mtg-chatbot
pnpm install
```

### 3. Configure Environment (1 min)

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=sk-your-key
PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Create Database (1 min)

1. Open Supabase dashboard
2. Go to SQL Editor
3. Click "New Query"
4. Copy entire contents of `backend/migrations/001_create_products_table.sql`
5. Click "Run"
6. Wait for green checkmark ✅

### 5. Start Development (1 min)

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Should see: "Server running on http://localhost:3001"
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Should see: "Ready in XXXms"
```

**Open in Browser:**
```
http://localhost:3000
```

You should see the demo page with a chat bubble in bottom-right corner.

## Testing It Works

### Quick Test

1. Click the chat bubble
2. Type: `"Class 10 science books"`
3. You should see: loading state → response → (no products yet, but API works)

### API Test

```bash
# In another terminal
curl http://localhost:3001/api/health
# Should return: {"status":"ok",...}

curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
# Should return: {answer:..., products:[]}
```

## Next: Index Products

Before products appear, you need to populate the database:

### Method 1: Manual Crawler Run

```bash
# Update MTG.in URLs in backend/crawler.js first
# Then run crawler:
curl -X POST http://localhost:3001/api/crawler/sync \
  -H "Authorization: Bearer your_crawler_token"
```

### Method 2: Load Sample Data

```bash
# Add this to Supabase using the SQL editor
INSERT INTO products (title, price, url, image_url, category, description, crawled_at)
VALUES 
('MTG Class 10 Science', '₹499', 'https://mtg.in/class-10-science', 'https://...', 'Class 10', 'Complete science guide', NOW()),
('MTG Class 10 Math', '₹549', 'https://mtg.in/class-10-math', 'https://...', 'Class 10', 'All math topics covered', NOW());
```

## File Structure

```
project/
├── app/                    # Next.js pages
│   ├── page.tsx           # Demo page
│   └── layout.tsx         # Root layout
├── components/
│   └── ChatBot.tsx        # Chat widget
├── backend/
│   ├── crawler.js         # Website scraper
│   ├── search.js          # Search engine
│   ├── formatter.js       # Response formatter
│   └── migrations/        # Database schemas
├── server.js              # Express API
├── .env.example           # Environment template
└── README.md              # Full documentation
```

## Common Commands

```bash
# Development
npm run dev              # Start Next.js
npm run dev:backend     # Start Express
npm run dev:all         # Start both (not set up yet)

# Production
npm run build            # Build Next.js
npm run start            # Start Next.js production
npm run start:backend    # Start Express production

# Other
npm run lint             # Run linter
npm install              # Install dependencies
```

## API Endpoints

| Endpoint | Method | Use |
|----------|--------|-----|
| `/api/chat` | POST | Send message |
| `/api/products/search?q=...` | GET | Search products |
| `/api/crawler/sync` | POST | Run crawler |
| `/api/health` | GET | Health check |
| `/api/stats` | GET | Stats |

## Example API Calls

### Chat
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What books do you have?",
    "session_id": "user123"
  }'
```

### Search
```bash
curl "http://localhost:3001/api/products/search?q=class%2010"
```

### Crawler
```bash
curl -X POST http://localhost:3001/api/crawler/sync \
  -H "Authorization: Bearer token"
```

## Environment Variables Explained

```env
SUPABASE_URL         # Database URL from Supabase
SUPABASE_KEY         # Database API key
OPENAI_API_KEY       # Your OpenAI API key
PORT                 # Backend port (default 3001)
NODE_ENV             # development/production
NEXT_PUBLIC_API_URL  # API URL for frontend
```

## Troubleshooting

### "ECONNREFUSED" when clicking chat
- Backend not running? Run `npm run dev:backend`
- Wrong API URL? Check `NEXT_PUBLIC_API_URL` in `.env.local`

### "OpenAI API error"
- API key wrong? Check in `.env.local`
- Account has credits? Check [platform.openai.com](https://platform.openai.com/account/billing/overview)

### "SUPABASE_URL is not defined"
- Missing `.env.local`? Run `cp .env.example .env.local`
- Not filled in? Edit file with your keys

### "No products showing"
- Crawler hasn't run? Use sample data (see above)
- Products not indexed? Check Supabase dashboard

### Port already in use
- Change PORT in `.env.local` (e.g., 3002)
- Or kill process: `lsof -i :3001 | kill -9 <PID>`

## Customization

### Change Bot Name
Edit `app/page.tsx`:
```tsx
<ChatBot
  appName="Your Bot Name"
  brand={{ color: '#e74c3c' }}
/>
```

### Change Colors
```tsx
brand={{
  color: '#your-color',
  logo: 'https://your-logo-url',
  name: 'Your Brand'
}}
```

### Add Products Manually
In Supabase SQL Editor:
```sql
INSERT INTO products (title, price, url, category, description)
VALUES ('Product Name', '₹999', 'https://...', 'Category', 'Description');
```

## Documentation

- **Full Setup:** [CHATBOT_SETUP.md](./CHATBOT_SETUP.md)
- **API Docs:** [API.md](./API.md)
- **Crawler Guide:** [CRAWLER_GUIDE.md](./CRAWLER_GUIDE.md)
- **Phase Summary:** [PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md)

## Next Steps

1. ✅ Follow this quick start
2. ✅ Test the chatbot works
3. 📖 Read [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) for deeper setup
4. 🕷️ Read [CRAWLER_GUIDE.md](./CRAWLER_GUIDE.md) to configure crawler
5. 🚀 Deploy to production when ready

## Getting Help

- Check the relevant `.md` file (guides above)
- Review API errors in terminal
- Check Supabase dashboard for data
- Look at network requests in browser DevTools

## Time Breakdown

| Step | Time |
|------|------|
| Get API keys | 2 min |
| Clone & install | 1 min |
| Configure | 1 min |
| Create database | 1 min |
| Start servers | 1 min |
| **Total** | **~6 minutes** |

---

**Ready to go!** 🚀

If you hit issues, check [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) troubleshooting section.
