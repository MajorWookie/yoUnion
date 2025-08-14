-- Add semantic search functionality for companies
-- This migration adds a PostgreSQL function to perform similarity search using vector embeddings

-- Create function for semantic company search
CREATE OR REPLACE FUNCTION search_companies_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  ticker text,
  name text,
  logo_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.ticker,
    c.name,
    c.logo_url,
    (1 - (e.embedding <=> query_embedding)) as similarity
  FROM companies c
  JOIN embeddings e ON c.id = e.company_id
  WHERE 
    e.source = 'company_overview'
    AND (1 - (e.embedding <=> query_embedding)) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create index on embeddings for faster similarity search
-- Using cosine distance (<=>) which is what we use in the function
CREATE INDEX IF NOT EXISTS idx_embeddings_cosine_distance 
ON embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Optional: Create index for inner product distance as well
CREATE INDEX IF NOT EXISTS idx_embeddings_inner_product 
ON embeddings USING ivfflat (embedding vector_ip_ops) 
WITH (lists = 100);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_companies_by_embedding(vector, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION search_companies_by_embedding(vector, float, int) TO anon;

-- Create a helper function to test embedding similarity
CREATE OR REPLACE FUNCTION test_embedding_similarity(
  company_ticker text,
  test_query text
)
RETURNS TABLE (
  company_name text,
  similarity float,
  embedding_content text
)
LANGUAGE plpgsql
AS $$
DECLARE
  test_embedding vector(1536);
BEGIN
  -- For testing purposes, this would need the embedding service
  -- In practice, you'd pass the embedding from your application
  RAISE NOTICE 'This function requires an embedding to be passed from the application';
  
  RETURN QUERY
  SELECT 
    c.name as company_name,
    0.0::float as similarity,
    e.content as embedding_content
  FROM companies c
  JOIN embeddings e ON c.id = e.company_id
  WHERE 
    c.ticker = UPPER(company_ticker)
    AND e.source = 'company_overview';
END;
$$;

-- Grant execute permission for the test function
GRANT EXECUTE ON FUNCTION test_embedding_similarity(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION test_embedding_similarity(text, text) TO anon;

-- Add comment explaining the search function
COMMENT ON FUNCTION search_companies_by_embedding(vector, float, int) IS 
'Performs semantic similarity search on companies using vector embeddings. 
Returns companies ranked by cosine similarity to the query embedding.
Parameters:
- query_embedding: The vector representation of the search query
- match_threshold: Minimum similarity score (0-1, default 0.7)  
- match_count: Maximum number of results to return (default 20)';