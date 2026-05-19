-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  category TEXT,
  
  -- Vector embeddings for semantic search
  embedding vector(1536),
  
  -- Metadata
  crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexing
  CONSTRAINT title_not_empty CHECK (title != '')
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_products_title ON products USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_description ON products USING GIN(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_products_url ON products(url);

-- Create function for vector search
CREATE OR REPLACE FUNCTION search_products(
  query_embedding vector,
  similarity_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price TEXT,
  url TEXT,
  image_url TEXT,
  category TEXT,
  similarity FLOAT
) AS $$
  SELECT
    products.id,
    products.title,
    products.description,
    products.price,
    products.url,
    products.image_url,
    products.category,
    1 - (products.embedding <=> query_embedding) as similarity
  FROM products
  WHERE products.embedding IS NOT NULL
  ORDER BY products.embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE SQL;

-- Create chat_sessions table for storing conversation history
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_info JSONB
);

CREATE INDEX IF NOT EXISTS idx_sessions_created ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON chat_sessions(session_id);

-- Enable Row Level Security (optional, configure as needed)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON chat_sessions
  FOR SELECT USING (true);
