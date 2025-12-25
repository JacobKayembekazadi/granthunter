// Generate embeddings using OpenAI API (or local model)
export async function generateEmbedding(text: string): Promise<number[]> {
  // For now, use OpenAI's embedding API
  // In production, you might want to use a local model or Supabase's built-in embeddings
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Alternative: Use Supabase's built-in pgvector with a local embedding model
// or use Supabase's edge function for embeddings

