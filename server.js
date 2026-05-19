import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { crawlMTGWebsite } from './backend/crawler.js';
import { searchProducts } from './backend/search.js';
import { formatProductResponse } from './backend/formatter.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Session storage (in production, use Redis or database)
const sessions = new Map();

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, session_id } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const currentSessionId = session_id || uuidv4();
    
    console.log(`[Chat] Session: ${currentSessionId}, Message: ${message.substring(0, 50)}...`);

    // Step 1: Search products in knowledge base
    const searchResults = await searchProducts(supabase, message);

    // Step 2: Generate AI response using RAG
    const context = searchResults
      .map((p) => `Product: ${p.title}, Price: ${p.price}, URL: ${p.url}, Description: ${p.description}`)
      .join('\n');

    const systemPrompt = `You are a helpful customer service chatbot for MTG.in, an online educational content and exam preparation platform.

IMPORTANT RULES:
1. Only answer questions based on MTG.in website content and products.
2. If you don't have information, respond: "This information is currently not available on the website. Please contact the MTG support team for more details."
3. Be concise and helpful.
4. Always include product links when relevant.
5. Never make up prices or availability.
6. Use Hindi and English as needed for clarity.

Available Products Context:
${context || 'No products found in knowledge base'}`;

    const userMessage = `User question: "${message}"

If relevant products were found, include them in your response. Format product recommendations clearly.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = response.choices[0].message.content;

    // Step 3: Format products for response
    const products = searchResults.slice(0, 3).map(formatProductResponse);

    const chatResponse = {
      answer,
      products,
      session_id: currentSessionId,
      source: searchResults.length > 0 ? 'website_content' : 'general',
      timestamp: new Date().toISOString(),
    };

    // Store session info
    sessions.set(currentSessionId, {
      created: new Date(),
      messages: [{ role: 'user', content: message }, { role: 'assistant', content: answer }],
    });

    res.json(chatResponse);
  } catch (error) {
    console.error('[Chat Error]', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      message: error.message,
    });
  }
});

// Product search endpoint
app.get('/api/products/search', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`[Search] Query: ${query}`);

    const results = await searchProducts(supabase, query);

    res.json({
      query,
      results: results.map(formatProductResponse),
      count: results.length,
    });
  } catch (error) {
    console.error('[Search Error]', error);
    res.status(500).json({
      error: 'Failed to search products',
      message: error.message,
    });
  }
});

// Crawler endpoint (admin only - should be protected)
app.post('/api/crawler/sync', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const crawlerToken = process.env.CRAWLER_TOKEN;

    if (!crawlerToken || authHeader !== `Bearer ${crawlerToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[Crawler] Starting crawl...');
    
    // This will be implemented in Phase 1
    const results = await crawlMTGWebsite(supabase);

    res.json({
      status: 'success',
      message: 'Crawl completed',
      products_indexed: results.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Crawler Error]', error);
    res.status(500).json({
      error: 'Failed to run crawler',
      message: error.message,
    });
  }
});

// Get knowledge base stats
app.get('/api/stats', async (req, res) => {
  try {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    res.json({
      total_products: count || 0,
      status: 'ready',
    });
  } catch (error) {
    console.error('[Stats Error]', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Server] MTG.in Chatbot API running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
