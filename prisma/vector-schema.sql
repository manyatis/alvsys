-- alvsys Vector Database Schema for Supabase
-- Run this on your Supabase instance after main schema

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Vector embeddings table
CREATE TABLE card_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id TEXT NOT NULL, -- References main DB card ID
    project_id TEXT NOT NULL, -- For filtering by project
    
    -- Content being vectorized
    title TEXT NOT NULL,
    description TEXT,
    acceptance_criteria TEXT,
    
    -- Metadata for context
    status TEXT,
    priority INTEGER,
    is_ai_allowed BOOLEAN,
    github_issue_id INTEGER,
    
    -- Vector embedding (OpenAI ada-002 = 1536 dimensions)
    embedding vector(1536),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for fast lookups
    UNIQUE(card_id)
);

-- Comment embeddings table  
CREATE TABLE comment_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id TEXT NOT NULL, -- References main DB comment ID
    card_id TEXT NOT NULL, -- Parent card
    project_id TEXT NOT NULL, -- For filtering
    
    -- Content
    content TEXT NOT NULL,
    author_type TEXT NOT NULL, -- 'human' or 'ai'
    
    -- Context metadata
    is_ai_comment BOOLEAN DEFAULT FALSE,
    github_comment_id INTEGER,
    
    -- Vector embedding
    embedding vector(1536),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(comment_id)
);

-- Composite search view for unified queries
CREATE VIEW memory_search AS 
SELECT 
    'card' as content_type,
    card_id as source_id,
    project_id,
    title as content,
    description as additional_context,
    status,
    embedding,
    created_at,
    updated_at
FROM card_embeddings
UNION ALL
SELECT 
    'comment' as content_type,
    comment_id as source_id,
    project_id,
    content,
    null as additional_context,
    null as status,
    embedding,
    created_at,
    updated_at
FROM comment_embeddings;

-- Indexes for fast vector similarity search
CREATE INDEX ON card_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON comment_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Indexes for filtering
CREATE INDEX ON card_embeddings (project_id, updated_at);
CREATE INDEX ON comment_embeddings (project_id, card_id, updated_at);
CREATE INDEX ON card_embeddings (card_id, synced_at);
CREATE INDEX ON comment_embeddings (comment_id, synced_at);

-- Function to search similar content
CREATE OR REPLACE FUNCTION search_similar_memory(
    query_embedding vector(1536),
    project_filter TEXT,
    similarity_threshold FLOAT DEFAULT 0.7,
    result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    content_type TEXT,
    source_id TEXT,
    content TEXT,
    additional_context TEXT,
    similarity FLOAT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.content_type,
        m.source_id,
        m.content,
        m.additional_context,
        1 - (m.embedding <=> query_embedding) as similarity,
        m.created_at
    FROM memory_search m
    WHERE m.project_id = project_filter
        AND 1 - (m.embedding <=> query_embedding) > similarity_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;