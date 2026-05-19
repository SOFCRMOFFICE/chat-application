import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { searchProducts } from '../backend/search.js';
import { formatProductResponse } from '../backend/formatter.js';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Session storage in Supabase
async function getOrCreateSession(sessionId) {
  if (!sessionId) {
    sessionId = uuidv4();
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Session error:', error);
    throw error;
  }

  if (!data) {
    const { data: newSession, error: insertError } = await supabase
      .from('chat_sessions')
      .insert([{
        session_id: sessionId,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    return newSession;
  }

  return data;
}

// Main handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, session_id } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 chars)' });
    }

    // Get or create session
    const session = await getOrCreateSession(session_id);
    const currentSessionId = session.session_id;

    console.log(`[Chat] Session: ${currentSessionId}, Message: ${message.substring(0, 50)}...`);

    // Search for relevant products
    const searchResults = await searchProducts(message, 5);

    // Build system prompt
    const systemPrompt = `You are a helpful customer service assistant for MTG.in, an Indian educational books and exam preparation website.

Your responsibilities:
1. Answer questions about MTG.in products, books, and exam preparation materials
2. Provide information only from the available product database
3. If information is not available on the website, clearly state: "This information is currently not available on the website. Please contact the MTG support team for more details."
4. Always suggest relevant products when appropriate
5. Be helpful, friendly, and professional
6. Respond in the same language as the user (support English and Hindi)

Available products context:
${searchResults.map(p => `- ${p.title} (₹${p.price}): ${p.description}\n  Category: ${p.category}`).join('\n')}

Important rules:
- Never guess or invent prices, availability, or product details
- Always provide product links when recommending products
- If asked about policies, orders, or support, direct them to contact support
- Keep responses concise and helpful`;

    // Build conversation history
    const conversationHistory = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: message,
      },
    ];

    // Get AI response
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0].message.content;

    // Format response with product cards
    const formattedResponse = {
      answer: assistantMessage,
      products: searchResults.length > 0 ? formatProductResponse(searchResults) : [],
      source: 'website_content',
      session_id: currentSessionId,
      timestamp: new Date().toISOString(),
    };

    // Store conversation in database
    await supabase.from('chat_messages').insert([
      {
        session_id: currentSessionId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      },
      {
        session_id: currentSessionId,
        role: 'assistant',
        content: assistantMessage,
        products_json: searchResults,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to process chat request',
      message: error.message,
    });
  }
}
