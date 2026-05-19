import { createClient } from '@supabase/supabase-js';
import { searchProducts } from '../../backend/search.js';
import { formatProductResponse } from '../../backend/formatter.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (q.length > 500) {
      return res.status(400).json({ error: 'Query too long' });
    }

    console.log(`[Search] Query: ${q}`);

    // Search products
    const results = await searchProducts(q, Math.min(parseInt(limit), 50));

    return res.status(200).json({
      query: q,
      count: results.length,
      results: formatProductResponse(results),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Failed to search products',
      message: error.message,
    });
  }
}
