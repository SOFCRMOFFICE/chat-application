import { crawlMTGWebsite } from '../../backend/crawler.js';
import { createClient } from '@supabase/supabase-js';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify API key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.CRAWLER_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { urls, maxDepth = 2 } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    console.log(`[Crawler] Starting sync for ${urls.length} URLs`);

    // Run crawler (this is a background job, may take time)
    const results = await crawlMTGWebsite(urls, maxDepth);

    return res.status(200).json({
      status: 'completed',
      crawled: results.crawled || 0,
      indexed: results.indexed || 0,
      errors: results.errors || 0,
      timestamp: new Date().toISOString(),
      message: 'Crawler job completed successfully',
    });
  } catch (error) {
    console.error('Crawler error:', error);
    return res.status(500).json({
      error: 'Failed to run crawler',
      message: error.message,
    });
  }
}
