# MTG.in Chatbot - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                            │
│                       (Web Browser / Mobile)                         │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER (React 19)                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Next.js App                                                 │   │
│  │  ├─ app/layout.tsx (Root layout)                            │   │
│  │  ├─ app/page.tsx (Demo page)                               │   │
│  │  └─ app/globals.css (Styles)                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ChatBot Component (Reusable Widget)                        │   │
│  │  ├─ Floating chat bubble                                    │   │
│  │  ├─ Expandable chat window                                  │   │
│  │  ├─ Message list with timestamps                           │   │
│  │  ├─ Input field and send button                            │   │
│  │  ├─ Product card display                                   │   │
│  │  ├─ Loading states                                         │   │
│  │  └─ Error handling                                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Styling: Tailwind CSS + Responsive Design                          │
│  State: React hooks (useState, useRef, useEffect)                   │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      │ HTTP/REST API
                                      │ (JSON over HTTPS)
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│               BACKEND API LAYER (Node.js + Express)                  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Express Server (server.js)                                 │   │
│  │  ├─ Port: 3001 (development) or $PORT env var              │   │
│  │  ├─ CORS: Enabled for all origins                          │   │
│  │  ├─ Body Parser: JSON middleware                           │   │
│  │  └─ Error Handling: Global error handler                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  API ENDPOINTS                                              │   │
│  │                                                              │   │
│  │  1. POST /api/chat                                          │   │
│  │     ├─ Input: message, session_id                          │   │
│  │     ├─ Process:                                            │   │
│  │     │  1. Search products in knowledge base               │   │
│  │     │  2. Generate context from results                   │   │
│  │     │  3. Call OpenAI API                                 │   │
│  │     │  4. Format response with products                   │   │
│  │     └─ Output: answer, products[], session_id             │   │
│  │                                                              │   │
│  │  2. GET /api/products/search?q=query                        │   │
│  │     ├─ Input: search query                                 │   │
│  │     ├─ Process:                                            │   │
│  │     │  1. Generate embedding from query                   │   │
│  │     │  2. Vector similarity search (pgvector)             │   │
│  │     │  3. Fallback to keyword search if needed            │   │
│  │     └─ Output: results[], count                           │   │
│  │                                                              │   │
│  │  3. POST /api/crawler/sync                                  │   │
│  │     ├─ Auth: Bearer token required                         │   │
│  │     ├─ Process: Trigger website crawler                    │   │
│  │     └─ Output: status, products_indexed                    │   │
│  │                                                              │   │
│  │  4. GET /api/health                                         │   │
│  │     └─ Output: status, timestamp                           │   │
│  │                                                              │   │
│  │  5. GET /api/stats                                          │   │
│  │     └─ Output: total_products, status                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  BUSINESS LOGIC MODULES                                    │   │
│  │                                                              │   │
│  │  backend/crawler.js                                         │   │
│  │  ├─ crawlMTGWebsite(supabase)                              │   │
│  │  ├─ scrapeProductPage(url)                                │   │
│  │  ├─ storeProducts(supabase, products)                     │   │
│  │  └─ fetchProductDetails(url)                              │   │
│  │                                                              │   │
│  │  backend/search.js                                          │   │
│  │  ├─ searchProducts(supabase, query)                        │   │
│  │  ├─ getQueryEmbedding(query)                               │   │
│  │  ├─ semanticSearch(supabase, embedding)                   │   │
│  │  ├─ keywordSearch(supabase, query)                         │   │
│  │  └─ searchByCategory(supabase, category)                  │   │
│  │                                                              │   │
│  │  backend/formatter.js                                       │   │
│  │  ├─ formatProductResponse(product)                         │   │
│  │  ├─ formatProductList(products)                            │   │
│  │  ├─ formatChatResponse(answer, products)                   │   │
│  │  └─ normalizePrice(priceStr)                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Dependencies:                                                       │
│  ├─ express (HTTP server)                                          │
│  ├─ cors (Cross-origin requests)                                   │
│  ├─ axios (HTTP client)                                            │
│  ├─ cheerio (HTML parsing)                                         │
│  ├─ openai (OpenAI API client)                                     │
│  ├─ @supabase/supabase-js (Database client)                        │
│  └─ uuid (ID generation)                                            │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌──────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│   OPENAI API     │     │   SUPABASE         │     │  MTG.in WEBSITE    │
│                  │     │  (PostgreSQL)      │     │                    │
│ ├─ Chat API      │     │                    │     │ ├─ Product pages   │
│ │  (gpt-4o-mini) │     │  ┌──────────────┐ │     │ ├─ Category pages  │
│ │  - Streaming   │     │  │  PRODUCTS    │ │     │ └─ FAQ pages       │
│ │  - Context     │     │  │  TABLE       │ │     │                    │
│ │  - Temperature │     │  │              │ │     │ Technologies:      │
│ │                │     │  │ • id (UUID)  │ │     │ ├─ Axios (fetch)   │
│ └─ Embedding API │     │  │ • title      │ │     │ ├─ Cheerio (parse) │
│   (text-emb-3)   │     │  │ • price      │ │     │ └─ Playwright      │
│                  │     │  │ • url        │ │     │                    │
│ Pricing:         │     │  │ • image_url  │ │     │ Crawler Features:  │
│ ├─ Chat: ~$0.15  │     │  │ • category   │ │     │ ├─ User-Agent      │
│   per 1M tokens  │     │  │ • embedding  │ │     │ ├─ Timeout (10s)   │
│ └─ Embed: ~$0.02 │     │  │ • crawled_at │ │     │ ├─ Error handling  │
│   per 1M tokens  │     │  └──────────────┘ │     │ └─ Batch process   │
└──────────────────┘     │                    │     └────────────────────┘
                         │  ┌──────────────┐ │
                         │  │ CHAT_SESSIONS│ │
                         │  │   TABLE      │ │
                         │  │              │ │
                         │  │ • id (UUID)  │ │
                         │  │ • session_id │ │
                         │  │ • messages   │ │
                         │  │ • user_info  │ │
                         │  └──────────────┘ │
                         │                    │
                         │  INDEXES:         │
                         │  ├─ GIN (title)   │
                         │  ├─ GIN (desc)    │
                         │  ├─ B-tree (cat)  │
                         │  └─ IVFFlat (vec) │
                         │                    │
                         │  FUNCTIONS:       │
                         │  └─ search_products│
                         │     (Vector search)│
                         │                    │
                         │  Deployment:      │
                         │  └─ Cloud Platform│
                         │     (Supabase.co) │
                         └────────────────────┘
```

---

## Data Flow Diagram - Chat Request

```
USER TYPES MESSAGE
        │
        ▼
┌──────────────────────────────┐
│  Frontend: handleSendMessage │
└──────────────┬───────────────┘
               │
               ├─ Generate message ID
               ├─ Display user message
               ├─ Show loading state
               │
               ▼
        ┌──────────────┐
        │ POST /api/chat
        │ {             
        │   message,    
        │   session_id  
        │ }             
        └──────┬───────┘
               │
               ▼
    ┌────────────────────────┐
    │  Backend: /api/chat    │
    │  handler               │
    └────────┬───────────────┘
             │
             ├─ Validate input
             ├─ Validate session_id
             │
             ▼
    ┌────────────────────────┐
    │  searchProducts()      │
    │  in backend/search.js  │
    └────────┬───────────────┘
             │
             ├─ getQueryEmbedding()
             │  └─ OpenAI API: Generate embedding
             │
             ├─ semanticSearch()
             │  └─ Supabase: Vector similarity search
             │
             ├─ keywordSearch() (if semantic = 0 results)
             │  └─ Supabase: Full text search
             │
             └─ Return: products[]
                        (up to 5 results)
                
             ▼
    ┌─────────────────────────────┐
    │  OpenAI Chat Completion     │
    │  in server.js               │
    └────────┬────────────────────┘
             │
             ├─ Create prompt with:
             │  ├─ System message (role, constraints)
             │  ├─ Product context (found products)
             │  └─ User message
             │
             ├─ Call OpenAI gpt-4o-mini
             │  with temperature=0.7
             │
             └─ Return: answer text

             ▼
    ┌──────────────────────────┐
    │  formatProductResponse() │
    │  in backend/formatter.js │
    └────────┬─────────────────┘
             │
             ├─ Extract: id, title, price, url, image, desc
             └─ Return: formatted products

             ▼
    ┌──────────────────────────┐
    │  Build Response JSON     │
    │                          │
    │  {                       │
    │    answer: "...",        │
    │    products: [...],      │
    │    session_id: "...",    │
    │    source: "website",    │
    │    timestamp: "..."      │
    │  }                       │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │  Store Session (optional)│
    │  in Supabase             │
    │  chat_sessions table     │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │  Send Response           │
    │  HTTP 200 + JSON         │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │  Frontend: Receive Data  │
    │  setLoading(false)       │
    │  setMessages([...])      │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │  Render:                 │
    │  ├─ AI Answer text       │
    │  ├─ Product cards        │
    │  │  ├─ Images            │
    │  │  ├─ Titles            │
    │  │  ├─ Prices            │
    │  │  └─ Links             │
    │  └─ Timestamp            │
    └────────┬─────────────────┘
             │
             ▼
    USER SEES RESPONSE
```

---

## Data Flow Diagram - Product Search

```
USER SEARCHES: "Class 10 Science"
        │
        ▼
    GET /api/products/search?q=Class%2010%20Science
        │
        ▼
    searchProducts(supabase, "Class 10 Science")
        │
        ├─ Step 1: Generate Embedding
        │  │
        │  └─ openai.embeddings.create({
        │       model: "text-embedding-3-small",
        │       input: "Class 10 Science"
        │     })
        │
        │  Returns: [0.023, -0.045, 0.067, ...]  (1536 dimensions)
        │
        ├─ Step 2: Vector Similarity Search
        │  │
        │  └─ supabase.rpc('search_products', {
        │       query_embedding: embedding,
        │       similarity_threshold: 0.3,
        │       match_count: 5
        │     })
        │
        │  SQL FUNCTION:
        │  SELECT *
        │  FROM products
        │  ORDER BY (embedding <=> query_embedding)
        │  LIMIT 5
        │
        │  Returns: Top 5 similar products
        │
        └─ Step 3: Format Results
           │
           ├─ formatProductResponse() × 5
           │
           └─ Return JSON: results[], count

FRONTEND DISPLAYS RESULTS
```

---

## Crawler Flow Diagram

```
TRIGGER CRAWLER
curl -X POST /api/crawler/sync -H "Authorization: Bearer token"
        │
        ▼
Verify Authorization Token
        │ (if invalid → return 401)
        │
        ▼
Call crawlMTGWebsite(supabase)
        │
        ├─ Initialize URLs to scrape:
        │  ├─ https://www.mtg.in/books
        │  ├─ https://www.mtg.in/books/class-10
        │  ├─ https://www.mtg.in/books/jee
        │  └─ ... (more URLs)
        │
        └─ FOR EACH URL:
           │
           ├─ Step 1: Fetch
           │  │
           │  └─ axios.get(url, {
           │       timeout: 10000,
           │       headers: { 'User-Agent': '...' }
           │     })
           │
           ├─ Step 2: Parse HTML
           │  │
           │  └─ cheerio.load(html)
           │     Find: '.product-item', '.product-card', etc.
           │
           ├─ Step 3: Extract Data
           │  │
           │  ├─ Product Title: text from .title
           │  ├─ Product Price: extract ₹XXX
           │  ├─ Product URL: resolve relative URLs
           │  ├─ Product Image: src from img tag
           │  ├─ Category: extracted from URL
           │  └─ Description: text from .desc
           │
           ├─ Step 4: Generate Embedding
           │  │
           │  └─ openai.embeddings.create({
           │       model: "text-embedding-3-small",
           │       input: title + description
           │     })
           │
           └─ Step 5: Store in Supabase
              │
              └─ supabase.from('products').upsert([
                   {
                     id, title, price, url, image_url,
                     category, embedding, crawled_at
                   }
                 ], { onConflict: 'url' })

RETURN RESULTS
{
  "status": "success",
  "products_indexed": 245
}
```

---

## Database Schema Diagram

```
SUPABASE DATABASE (PostgreSQL with pgvector)

┌─────────────────────────────────────────────────────────────┐
│                    products TABLE                           │
├─────────────────────────────────────────────────────────────┤
│ Column         │ Type                 │ Properties          │
├────────────────┼──────────────────────┼─────────────────────┤
│ id             │ UUID                 │ PRIMARY KEY         │
│ title          │ TEXT                 │ NOT NULL            │
│ description    │ TEXT                 │ -                   │
│ price          │ TEXT                 │ -                   │
│ url            │ TEXT                 │ UNIQUE, NOT NULL    │
│ image_url      │ TEXT                 │ -                   │
│ category       │ TEXT                 │ -                   │
│ embedding      │ vector(1536)         │ For vector search   │
│ crawled_at     │ TIMESTAMP            │ DEFAULT NOW()       │
│ updated_at     │ TIMESTAMP            │ DEFAULT NOW()       │
└─────────────────────────────────────────────────────────────┘

INDEXES:
  • idx_products_title (GIN on title)
    └─ For full-text search on titles

  • idx_products_description (GIN on description)
    └─ For full-text search on descriptions

  • idx_products_category (B-tree on category)
    └─ For filtering by category

  • idx_products_embedding (IVFFlat on embedding)
    └─ For vector similarity search

  • idx_products_url (B-tree on url)
    └─ For uniqueness constraint

FUNCTION: search_products(
  query_embedding vector,
  similarity_threshold float,
  match_count int
) → products[]
  └─ Returns top N products ordered by cosine similarity

┌─────────────────────────────────────────────────────────────┐
│                chat_sessions TABLE                          │
├─────────────────────────────────────────────────────────────┤
│ Column         │ Type                 │ Properties          │
├────────────────┼──────────────────────┼─────────────────────┤
│ id             │ UUID                 │ PRIMARY KEY         │
│ session_id     │ TEXT                 │ UNIQUE, NOT NULL    │
│ messages       │ JSONB                │ Array of messages   │
│ created_at     │ TIMESTAMP            │ DEFAULT NOW()       │
│ updated_at     │ TIMESTAMP            │ DEFAULT NOW()       │
│ user_info      │ JSONB                │ Optional metadata   │
└─────────────────────────────────────────────────────────────┘

INDEXES:
  • idx_sessions_created (B-tree on created_at)
    └─ For finding recent sessions

  • idx_sessions_session_id (B-tree on session_id)
    └─ For fast session lookup
```

---

## Deployment Architecture

```
DEVELOPMENT
│
├─ Frontend: npm run dev
│  └─ Next.js dev server on http://localhost:3000
│
└─ Backend: npm run dev:backend
   └─ Express server on http://localhost:3001

STAGING / PRODUCTION
│
├─ FRONTEND (Vercel)
│  │
│  ├─ Edge Network (Global CDN)
│  │
│  ├─ Build: Next.js 16
│  │  └─ Output: Static + Server Components
│  │
│  └─ Environment Variables:
│     ├─ NEXT_PUBLIC_API_URL (Backend URL)
│     └─ Other public vars
│
├─ BACKEND (Railway / Render)
│  │
│  ├─ Node.js Runtime
│  │
│  ├─ Express Server
│  │
│  ├─ Environment Variables:
│  │  ├─ SUPABASE_URL
│  │  ├─ SUPABASE_KEY
│  │  ├─ OPENAI_API_KEY
│  │  ├─ PORT
│  │  └─ NODE_ENV
│  │
│  └─ Features:
│     ├─ Auto-deploy from Git
│     ├─ Health checks
│     ├─ Scaling (if needed)
│     └─ Logs & monitoring
│
└─ DATABASE (Supabase Cloud)
   │
   ├─ PostgreSQL Instance
   │
   ├─ pgvector Extension
   │
   ├─ Tables:
   │  ├─ products (with embeddings)
   │  └─ chat_sessions
   │
   ├─ Backups (automated daily)
   │
   ├─ Monitoring:
   │  ├─ Query logs
   │  ├─ Performance metrics
   │  ├─ Storage usage
   │  └─ Connection count
   │
   └─ Security:
      ├─ Row-Level Security (RLS)
      ├─ API authentication
      └─ SSL/TLS encryption
```

---

## Component Hierarchy

```
App (Next.js)
│
└─ RootLayout
   │
   ├─ <html>
   │  │
   │  ├─ <head>
   │  │  ├─ Metadata
   │  │  ├─ Fonts
   │  │  └─ Styles
   │  │
   │  └─ <body>
   │     │
   │     ├─ Providers (if any)
   │     │
   │     └─ Page Content
   │        │
   │        └─ <DemoPage>
   │           │
   │           ├─ <Header>
   │           │  ├─ Title
   │           │  └─ Description
   │           │
   │           ├─ <FeaturesSection>
   │           │  ├─ Feature Cards (4x)
   │           │  └─ Cards Container
   │           │
   │           ├─ <TechStack>
   │           │  └─ Tech Categories (3x)
   │           │     └─ Tech List Items
   │           │
   │           ├─ <SetupGuide>
   │           │  └─ Step-by-step Instructions
   │           │
   │           ├─ <CodeBlock>
   │           │  └─ Pre-formatted Code
   │           │
   │           └─ <ChatBot />
   │              │
   │              ├─ ChatBubble (when closed)
   │              │  └─ MessageCircle Icon
   │              │
   │              └─ ChatWindow (when open)
   │                 │
   │                 ├─ Header
   │                 │  ├─ Logo (optional)
   │                 │  ├─ Title
   │                 │  └─ Close Button
   │                 │
   │                 ├─ MessageContainer
   │                 │  └─ Message (repeating)
   │                 │     │
   │                 │     ├─ Text Bubble
   │                 │     ├─ Timestamp
   │                 │     │
   │                 │     └─ ProductCard (if has products)
   │                 │        ├─ Image
   │                 │        ├─ Title
   │                 │        ├─ Price
   │                 │        └─ Link
   │                 │
   │                 ├─ LoadingState
   │                 │  └─ Spinner + Text
   │                 │
   │                 └─ InputForm
   │                    ├─ TextInput
   │                    └─ SendButton
```

---

## State Management Flow

```
React Component State (Frontend)

ChatBot.tsx
│
├─ useState(isOpen)
│  └─ Toggle chat window visibility
│
├─ useState(messages[])
│  └─ Array of chat messages
│  └─ Each message: { id, type, content, products, timestamp }
│
├─ useState(input)
│  └─ Current input field value
│
├─ useState(loading)
│  └─ Loading state during API call
│
├─ useState(sessionId)
│  └─ Current session identifier
│
└─ useRef(messagesEndRef)
   └─ Reference for auto-scroll

Message Types:
├─ User Messages
│  ├─ type: "user"
│  ├─ content: "user typed text"
│  └─ products: []
│
└─ Assistant Messages
   ├─ type: "assistant"
   ├─ content: "AI response text"
   └─ products: [
      {
        id, title, price, url,
        image, description, category
      },
      ...
    ]
```

---

## Sequence Diagram - Complete Chat Flow

```
User                Frontend              Backend              OpenAI            Supabase
 │                    │                     │                   │                  │
 ├──Click Chat───────>│                     │                   │                  │
 │                    ├──Show Bubble────────>                   │                  │
 │                    │                     │                   │                  │
 ├──Type Message────>│                      │                   │                  │
 │                    │                     │                   │                  │
 ├──Click Send──────>│                      │                   │                  │
 │                    ├──POST /api/chat────>│                   │                  │
 │                    │  {message,          │                   │                  │
 │                    │   session_id}       │                   │                  │
 │                    │                     ├─searchProducts()─>│                  │
 │                    │                     │                   │                  │
 │                    │                     │                   │  Create─────────>│
 │                    │                     │                   │  Embedding       │
 │                    │                     │                   │  <──Return───────│
 │                    │                     │                   │                  │
 │                    │                     │<──Vector Search──────────────────────│
 │                    │                     │  (Top 5 products)                    │
 │                    │                     │                   │                  │
 │                    │                     ├──OpenAI Chat─────>│                  │
 │                    │                     │  (with context)   │                  │
 │                    │                     │  <──Response──────│                  │
 │                    │                     │                   │                  │
 │                    │                     ├──Format Response──│                  │
 │                    │                     │  ✓ Answer text                        │
 │                    │                     │  ✓ Products array                     │
 │                    │<──Response JSON─────│                   │                  │
 │                    │  {answer,           │                   │                  │
 │                    │   products[],       │                   │                  │
 │                    │   session_id}       │                   │                  │
 │<─Display Answer────│                     │                   │                  │
 │<─Show Products────│                      │                   │                  │
 │                    │                     │                   │                  │
 ├──Click Link──────>│ (opens new tab)      │                   │                  │
```

---

This architecture is designed for:
- **Scalability:** Serverless backend, cloud database
- **Reliability:** Error handling at each layer
- **Performance:** Vector search indexing, caching
- **Maintainability:** Modular code, clear separation of concerns
- **Security:** Token auth, CORS, environment variables

---

**Version:** 1.0.0  
**Last Updated:** May 2026
