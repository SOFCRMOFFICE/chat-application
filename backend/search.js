import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Search for products using semantic search + keyword fallback
 */
export async function searchProducts(supabase, query) {
  console.log(`[Search] Query: "${query}"`);

  try {
    // Step 1: Get embedding for the query
    const embedding = await getQueryEmbedding(query);

    // Step 2: Search using vector similarity
    const vectorResults = await semanticSearch(supabase, embedding);

    // Step 3: If no results, fall back to keyword search
    let results = vectorResults;
    if (vectorResults.length === 0) {
      console.log('[Search] Vector search returned no results, trying keyword search...');
      results = await keywordSearch(supabase, query);
    }

    console.log(`[Search] Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('[Search Error]', error);
    // Fallback to keyword search on error
    return await keywordSearch(supabase, query);
  }
}

/**
 * Get embedding for a query string using OpenAI
 */
async function getQueryEmbedding(query) {
  try {
    console.log('[Embedding] Getting embedding for query...');
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('[Embedding Error]', error);
    throw new Error('Failed to generate query embedding');
  }
}

/**
 * Semantic search using pgvector
 */
async function semanticSearch(supabase, embedding) {
  try {
    // Call RPC function for vector similarity search
    const { data, error } = await supabase.rpc('search_products', {
      query_embedding: embedding,
      similarity_threshold: 0.3,
      match_count: 5,
    });

    if (error) {
      console.error('[Semantic Search Error]', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Semantic Search Exception]', error);
    return [];
  }
}

/**
 * Keyword-based search fallback
 */
async function keywordSearch(supabase, query) {
  try {
    console.log('[Keyword Search] Searching for: ' + query);

    const keywords = query.toLowerCase().split(/\s+/);

    // Build search filter - search in title and description
    let searchFilter = supabase.from('products').select('*');

    // Search by keywords in title
    const titleFilter = keywords.map((kw) => `title.ilike.%${kw}%`).join(',');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(
        keywords
          .map((kw) => `title.ilike.%${kw}%,description.ilike.%${kw}%`)
          .join(',')
      )
      .limit(5);

    if (error) {
      console.error('[Keyword Search Error]', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Keyword Search Exception]', error);
    return [];
  }
}

/**
 * Search products by category
 */
export async function searchByCategory(supabase, category) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category', `%${category}%`)
      .limit(10);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Category Search Error]', error);
    return [];
  }
}

/**
 * Get all categories
 */
export async function getCategories(supabase) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .distinct();

    if (error) throw error;

    return data?.map((d) => d.category) || [];
  } catch (error) {
    console.error('[Categories Error]', error);
    return [];
  }
}

/**
 * Search with filters
 */
export async function advancedSearch(supabase, filters) {
  try {
    let query = supabase.from('products').select('*');

    if (filters.title) {
      query = query.ilike('title', `%${filters.title}%`);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.minPrice && filters.maxPrice) {
      // Note: Requires price to be stored as number
      // query = query.gte('price', filters.minPrice).lte('price', filters.maxPrice);
    }

    const { data, error } = await query.limit(20);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Advanced Search Error]', error);
    return [];
  }
}
