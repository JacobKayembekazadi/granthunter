import { retrievePastPerformance } from '@/lib/rag/retriever';

export async function buildRAGContext(
  query: string,
  maxResults: number = 5
): Promise<string> {
  const results = await retrievePastPerformance(query, maxResults);
  
  if (results.length === 0) {
    return 'No relevant past performance found.';
  }

  return results
    .map((result, index) => `
Past Performance Example ${index + 1}:
Title: ${result.title}
Agency: ${result.agency}
Value: ${result.value}
Description: ${result.description}
Relevance Score: ${result.score}
  `.trim())
    .join('\n\n');
}

