# MTG.in AI Chatbot - Setup & Development Guide

## Project Overview

A custom React-based AI chatbot for MTG.in that:
- Answers product-related questions using public website content
- Searches products semantically using OpenAI embeddings
- Displays product information and links
- Runs as a standalone demo (future WordPress integration ready)

## Tech Stack

### Frontend
- **React 19** - UI components
- **Next.js 16** - Framework & API routes
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Backend
- **Node.js + Express** - REST API server
- **OpenAI API** - Chat & embeddings
- **Supabase** - PostgreSQL + pgvector for vector search
- **Cheerio** - HTML parsing
- **Playwright** - Browser automation for crawling

### Deployment
- **Vercel** - Frontend & serverless functions
- **Supabase** - Database & vector store

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Demo page
│   └── globals.css         # Global styles
├── components/
│   └── ChatBot.tsx         # Main chatbot widget
├── backend/
│   ├── crawler.js          # Website crawler
│   ├── search.js           # Semantic & keyword search
│   ├── formatter.js        # Response formatting
│   └── migrations/
│       └── 001_create_products_table.sql  # Database schema
├── server.js               # Express API server
├── .env.example            # Environment template
├── CHATBOT_SETUP.md        # This file
└── package.json            # Dependencies
```

## Setup Instructions

### 1. Prerequisites

Ensure you have:
- Node.js 18+ (LTS recommended)
- pnpm/npm/yarn package manager
- Supabase account (free tier available)
- OpenAI API key

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-...

# Server
PORT=3001
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**How to get these values:**

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy `Project URL` and `anon key`

#### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key in Settings → API keys
3. Paste the key in `OPENAI_API_KEY`

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Create Database Tables

In your Supabase dashboard:
1. Go to SQL Editor
2. Create a new query
3. Copy the entire contents of `backend/migrations/001_create_products_table.sql`
4. Click "Run"

This creates:
- `products` table - stores crawled products
- `chat_sessions` table - conversation history
- Vector similarity search function

### 5. Start Development

Open two terminals:

**Terminal 1: Backend API**
```bash
npm run dev:backend
# Server runs on http://localhost:3001
```

**Terminal 2: Frontend**
```bash
npm run dev
# App runs on http://localhost:3000
```

Visit `http://localhost:3000` to see the demo page.

## API Endpoints

### POST /api/chat
Send a message and get a response with relevant products.

**Request:**
```json
{
  "message": "Class 10 science books",
  "session_id": "session_abc123"
}
```

**Response:**
```json
{
  "answer": "I found several science books for Class 10...",
  "products": [
    {
      "id": "uuid",
      "title": "Product Name",
      "price": "₹XXX",
      "url": "https://mtg.in/product/...",
      "image": "https://...",
      "description": "Short description",
      "category": "Class 10"
    }
  ],
  "session_id": "session_abc123",
  "source": "website_content"
}
```

### GET /api/products/search?q=query
Search for products by keyword.

**Response:**
```json
{
  "query": "Class 10",
  "results": [
    {
      "id": "uuid",
      "title": "Product Name",
      "price": "₹XXX",
      "url": "https://mtg.in/...",
      "description": "Description"
    }
  ],
  "count": 5
}
```

### POST /api/crawler/sync
Trigger website crawl to fetch and index products.

**Headers:**
```
Authorization: Bearer your_crawler_token
```

**Response:**
```json
{
  "status": "success",
  "message": "Crawl completed",
  "products_indexed": 245
}
```

### GET /api/health
Check if the API is running.

### GET /api/stats
Get knowledge base statistics.

## How the Chatbot Works

### 1. User Asks Question
```
User: "What are Class 10 science books?"
```

### 2. Backend Processes Query
- Converts text to embedding using OpenAI
- Searches Supabase vector store for similar products
- Falls back to keyword search if needed

### 3. AI Generates Response
- Uses GPT-4o-mini with context from found products
- Enforces website-only answer rule
- Returns formatted response with product cards

### 4. Frontend Displays Results
- Shows AI answer in chat bubble
- Displays product cards with images, prices, links
- User can click to view product

## Customization

### Change Bot Name/Branding
In `app/page.tsx`, update the ChatBot props:

```tsx
<ChatBot
  appName="My Custom Bot"
  brand={{
    color: '#e74c3c',
    logo: 'https://example.com/logo.png',
    name: 'My Brand',
  }}
/>
```

### Adjust AI Behavior
Edit the system prompt in `server.js`:

```javascript
const systemPrompt = `You are a helpful assistant for MY_WEBSITE...`;
```

### Change Search Thresholds
In `backend/search.js`, adjust similarity threshold:

```javascript
const vectorResults = await semanticSearch(supabase, embedding, 0.5); // Higher = stricter
```

### Add Custom Product Selectors
In `backend/crawler.js`, update CSS selectors:

```javascript
$('.my-product-selector').each((_, element) => {
  // Custom parsing logic
});
```

## Crawling MTG.in Website

### Manual Crawl

1. Update MTG.in URLs in `backend/crawler.js`:
```javascript
const urlsToScrape = [
  'https://www.mtg.in/products/class-10',
  'https://www.mtg.in/products/jee',
  // Add more URLs
];
```

2. Customize CSS selectors to match MTG.in HTML structure

3. Run crawler:
```bash
curl -X POST http://localhost:3001/api/crawler/sync \
  -H "Authorization: Bearer your_crawler_token" \
  -H "Content-Type: application/json"
```

### Scheduled Crawling (Production)

Use Vercel Crons or external service:

```bash
# Runs daily at 2 AM
0 2 * * * curl -X POST https://your-app.vercel.app/api/crawler/sync -H "Authorization: Bearer token"
```

## Testing

### Test the Chatbot Locally

1. Start backend: `npm run dev:backend`
2. Start frontend: `npm run dev`
3. Open `http://localhost:3000`
4. Click the chat bubble and type questions

### Test the API Directly

```bash
# Chat endpoint
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Class 10 books","session_id":"test123"}'

# Search endpoint
curl "http://localhost:3001/api/products/search?q=class%2010"

# Health check
curl http://localhost:3001/api/health
```

## Deployment to Vercel

### Deploy Frontend

```bash
vercel deploy
```

### Deploy Backend

Option 1: Deploy as Vercel Function
```bash
# Move server.js to api/chat.js
# Move backend modules to lib/
# Deploy with `vercel deploy`
```

Option 2: Deploy to Railway/Render for backend

```bash
# Update NEXT_PUBLIC_API_URL in .env.production
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## Troubleshooting

### "SUPABASE_URL is not defined"
- Ensure `.env.local` is created and populated
- Backend must read from `.env.local` (use `dotenv` package)

### "OpenAI API error"
- Check API key is valid
- Verify account has credits
- Check rate limits (free tier limited)

### "No products found"
- Crawler hasn't run yet
- Check Supabase database for products table
- Verify CSS selectors match actual MTG.in HTML

### Chat returns generic answers
- Add more products to knowledge base
- Verify embeddings are being generated
- Check OpenAI API response in logs

### CORS errors in browser
- Ensure backend has CORS enabled (it does by default)
- Check `NEXT_PUBLIC_API_URL` matches backend URL

## Performance Tips

1. **Cache embeddings** - Store generated embeddings to reduce API calls
2. **Batch indexing** - Process products in batches during crawl
3. **Limit search results** - Return top 5 products only
4. **Enable Supabase caching** - Use pg_cacheinval
5. **Use CDN for images** - Store product images on Vercel Blob

## Security Considerations

✅ **Already Implemented:**
- Environment variables for secrets
- CORS headers configured
- Crawler token protection
- No WordPress/DB direct access
- Website-only answer validation

⚠️ **For Production:**
- Add rate limiting (express-rate-limit)
- Enable RLS policies in Supabase
- Add authentication for admin endpoints
- Validate user input on backend
- Monitor API usage and costs

## Next Steps

### Phase 2 Checklist
- [ ] Connect Supabase database
- [ ] Test crawler on MTG.in
- [ ] Index products with embeddings
- [ ] Verify search accuracy

### Phase 3 Checklist
- [ ] Test chat API endpoints
- [ ] Refine AI prompt
- [ ] Add error handling
- [ ] Implement logging

### Phase 4 Checklist
- [ ] Style chatbot widget
- [ ] Test on mobile
- [ ] Add animations
- [ ] Create standalone bundle

### Phase 5 Checklist
- [ ] Deploy to staging
- [ ] Load testing
- [ ] Monitor costs
- [ ] Gather feedback

## Support & Maintenance

### Regular Tasks
- Monitor API costs (OpenAI, Supabase)
- Re-crawl products weekly
- Check for broken links
- Update product data
- Monitor error logs

### Getting Help
- Check logs: `npm run dev:backend` output
- Review API responses in browser DevTools
- Check Supabase dashboard for data
- Test endpoints with curl/Postman

## Additional Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cheerio Documentation](https://cheerio.js.org)

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Maintainer:** v0 Assistant
