# MTG.in AI Chatbot

> An intelligent customer service chatbot for MTG.in that answers product questions, searches inventory, and provides personalized recommendations using AI and semantic search.

![Status](https://img.shields.io/badge/status-development-yellow)
![License](https://img.shields.io/badge/license-proprietary-red)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## 🎯 Features

- **🤖 AI-Powered Chat** - GPT-4o-mini with context-aware responses
- **🔍 Semantic Search** - Find products using embeddings
- **📚 Product Discovery** - Show prices, images, descriptions, and links
- **💬 Conversation History** - Maintain context across messages
- **📱 Mobile Responsive** - Works on desktop and mobile
- **🎨 Customizable Branding** - Match your brand colors and logo
- **🔐 Website-Only Answers** - Only responds with publicly available information
- **⚡ Fast & Scalable** - Vector database for quick semantic search

## 🚀 Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone <repository>
cd mtg-chatbot
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local with your API keys:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_key
# OPENAI_API_KEY=your_openai_key
```

### 3. Create Database

In Supabase dashboard:
- Run SQL from `backend/migrations/001_create_products_table.sql`

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev
```

## 🌐 Deploy to Vercel (Production)

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

**Quick Deploy:**
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy (auto-deploys on push)

```bash
# Deploy with Vercel CLI
vercel
```

### 4. Start Development

```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Frontend (in another terminal)
npm run dev
```

Open `http://localhost:3000` in your browser.

## 📋 Requirements

- **Node.js** 18+ (LTS)
- **pnpm** (or npm/yarn)
- **Supabase** account (free tier)
- **OpenAI API** key

## 📁 Project Structure

```
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Demo page
│   └── globals.css              # Styles
├── components/
│   └── ChatBot.tsx              # Main chat widget
├── backend/
│   ├── crawler.js               # Website scraper
│   ├── search.js                # Semantic search
│   ├── formatter.js             # Response formatting
│   └── migrations/              # Database schema
├── server.js                     # Express API server
├── package.json
├── CHATBOT_SETUP.md             # Detailed setup guide
├── API.md                       # API documentation
├── CRAWLER_GUIDE.md             # Crawler configuration
└── README.md                    # This file
```

## 🔧 Configuration

### Environment Variables

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

### Customize Chatbot

```tsx
<ChatBot
  apiUrl={process.env.NEXT_PUBLIC_API_URL}
  appName="My Custom Bot"
  brand={{
    color: '#e74c3c',
    logo: 'https://example.com/logo.png',
    name: 'My Brand',
  }}
/>
```

## 📖 Documentation

- **[CHATBOT_SETUP.md](./CHATBOT_SETUP.md)** - Complete setup and development guide
- **[API.md](./API.md)** - REST API reference
- **[CRAWLER_GUIDE.md](./CRAWLER_GUIDE.md)** - Website crawler configuration

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get response |
| GET | `/api/products/search?q=query` | Search products |
| POST | `/api/crawler/sync` | Trigger website crawl |
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Knowledge base stats |

**Example:**

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Class 10 science books",
    "session_id": "user_123"
  }'
```

## 🤖 How It Works

```
User Message
    ↓
Convert to Embedding (OpenAI)
    ↓
Search Database (pgvector + Keyword)
    ↓
Generate Response (GPT-4o-mini with context)
    ↓
Format Products
    ↓
Send to Frontend
```

## 📊 Tech Stack

### Frontend
- React 19
- Next.js 16
- TypeScript
- Tailwind CSS
- Lucide Icons

### Backend
- Node.js + Express
- OpenAI API (Chat + Embeddings)
- Supabase (PostgreSQL + pgvector)
- Cheerio (HTML parsing)
- Playwright (Browser automation)

### Deployment
- Vercel (Frontend)
- Supabase (Database)
- Optional: Railway/Render (Backend)

## 🚢 Deployment

### Deploy Frontend to Vercel

```bash
vercel deploy
```

### Deploy Backend

**Option 1: Vercel Functions**
```bash
# Rename files, structure for Vercel serverless
vercel deploy
```

**Option 2: Railway/Render**
```bash
# Push to Railway/Render repository
git push railway main
```

**Update API URL:**
```env
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

## 🧪 Testing

### Manual Testing

1. Open chatbot widget
2. Ask: "Class 10 science books"
3. Verify product results appear

### API Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Chat API
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","session_id":"123"}'

# Search API
curl "http://localhost:3001/api/products/search?q=class%2010"
```

## 🔄 Running Crawler

### Manually

```bash
curl -X POST http://localhost:3001/api/crawler/sync \
  -H "Authorization: Bearer your_token"
```

### Scheduled (Production)

Set up via Vercel Crons or external service.

## 📈 Monitoring

- Check console logs: `npm run dev:backend`
- Monitor Supabase dashboard for data
- Track API usage and costs
- Watch for errors in application logs

## 🔒 Security

✅ Implemented:
- Environment variables for secrets
- CORS headers configured
- Crawler token protection
- Website-only validation

⚠️ Before Production:
- Add rate limiting
- Enable RLS policies
- Implement authentication
- Monitor API costs
- Add input validation

## 🤝 Contributing

This is a proprietary project. Contact maintainers for contributions.

## 📝 Development Phases

- [x] Phase 1: Website crawler setup
- [x] Phase 2: Knowledge base & search
- [x] Phase 3: AI chat backend
- [x] Phase 4: React chat widget
- [ ] Phase 5: Testing & demo deployment
- [ ] Phase 6: WordPress integration

## 🐛 Troubleshooting

### No Products Found
1. Run crawler: `POST /api/crawler/sync`
2. Check Supabase: `SELECT COUNT(*) FROM products;`
3. Verify embeddings are generated

### API Connection Error
1. Ensure backend running: `npm run dev:backend`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS headers

### Chat Returns Generic Answers
1. Add more products to knowledge base
2. Verify OpenAI API key and balance
3. Check error logs for API issues

See [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) for more troubleshooting.

## 📞 Support

- Email: support@mtg.in
- Docs: See README and markdown files in project
- Issues: GitHub issues (if public)

## 📅 Timeline

| Phase | Status | Duration |
|-------|--------|----------|
| Phase 1: Crawler | ✅ Complete | 2-3 days |
| Phase 2: Knowledge Base | ✅ Complete | 2-3 days |
| Phase 3: AI Backend | ✅ Complete | 3-5 days |
| Phase 4: React Widget | ✅ Complete | 3-5 days |
| Phase 5: Testing & Deploy | ⏳ In Progress | 2-3 days |
| Phase 6: WordPress Integration | 📋 Planned | 3-5 days |

## 📜 License

Proprietary - All rights reserved to MTG.in

## 👨‍💻 Author

Built with ❤️ by v0 AI Assistant  
Last Updated: May 2026

---

## Quick Links

- 📚 [Full Setup Guide](./CHATBOT_SETUP.md)
- 🔌 [API Reference](./API.md)
- 🕷️ [Crawler Configuration](./CRAWLER_GUIDE.md)
- 🚀 [Deploy to Vercel](https://vercel.com/docs/deployments)
- 🗄️ [Supabase Dashboard](https://app.supabase.com)

## Next Steps

1. **Set up environment variables** in `.env.local`
2. **Create database schema** in Supabase
3. **Start backend**: `npm run dev:backend`
4. **Start frontend**: `npm run dev`
5. **Test the chatbot** at `http://localhost:3000`
6. **Configure crawler** for MTG.in website
7. **Run crawler** to index products
8. **Deploy to Vercel** when ready

**Questions?** Check the [detailed setup guide](./CHATBOT_SETUP.md) or [API documentation](./API.md).
