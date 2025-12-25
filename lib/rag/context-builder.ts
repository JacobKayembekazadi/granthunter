import { retrievePastPerformance, PastPerformanceResult } from './retriever';

export interface RAGContext {
  pastPerformance: string;
  summary: string;
}

export async function buildRAGContext(
  query: string,
  maxResults: number = 5
): Promise<RAGContext> {
  const results = await retrievePastPerformance(query, maxResults);

  if (results.length === 0) {
    return {
      pastPerformance: 'No relevant past performance found.',
      summary: 'No matching past performance examples available.',
    };
  }

  const pastPerformanceText = results
    .map((result, index) => `
Example ${index + 1} (Relevance: ${(result.score * 100).toFixed(1)}%):
Title: ${result.title}
Agency: ${result.agency}
Contract Value: ${result.value}
Description: ${result.description}
  `.trim())
    .join('\n\n');

  const summary = `Found ${results.length} relevant past performance example(s) with average relevance score of ${(results.reduce((sum, r) => sum + r.score, 0) / results.length * 100).toFixed(1)}%.`;

  return {
    pastPerformance: pastPerformanceText,
    summary,
  };
}

