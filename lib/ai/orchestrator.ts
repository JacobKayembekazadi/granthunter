import { geminiClient, claudeClient, deepSeekRequest } from './clients';
import { getCached, setCached } from '@/lib/redis';
import { rateLimit } from '@/lib/redis';

export type ModelRole = 'navigator' | 'scout' | 'architect' | 'editor';

export interface GenerationOptions {
  role: ModelRole;
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateWithModel(options: GenerationOptions): Promise<string> {
  const { role, prompt, context, temperature = 0.7, maxTokens = 2000 } = options;

  // Check rate limits
  const rateLimitKey = `rate_limit:${role}`;
  const rateLimitResult = await rateLimit(rateLimitKey, 100, 3600); // 100 requests per hour
  
  if (!rateLimitResult.allowed) {
    throw new Error(`Rate limit exceeded for ${role}. Try again later.`);
  }

  // Check cache
  const cacheKey = `ai_cache:${role}:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
  const cached = await getCached<string>(cacheKey);
  if (cached) {
    return cached;
  }

  let result: string;

  try {
    switch (role) {
      case 'navigator':
        // Navigator uses Gemini Live (handled separately in useGeminiLive hook)
        throw new Error('Navigator should use Gemini Live API directly');
      
      case 'scout':
        // Use DeepSeek for cost efficiency, fallback to Gemini 1.5 Flash
        try {
          result = await deepSeekRequest(prompt, { model: 'deepseek-chat' });
        } catch (error) {
          console.warn('DeepSeek failed, falling back to Gemini:', error);
          const response = await geminiClient.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: { temperature, maxOutputTokens: maxTokens },
          });
          result = response.text || '';
        }
        break;
      
      case 'architect':
        // Use Gemini 1.5 Pro for proposal writing
        const architectResponse = await geminiClient.models.generateContent({
          model: 'gemini-1.5-pro',
          contents: context ? `${context}\n\n${prompt}` : prompt,
          config: { temperature, maxOutputTokens: maxTokens },
        });
        result = architectResponse.text || '';
        break;
      
      case 'editor':
        // Use Claude 3.5 Sonnet for compliance checking
        const editorResponse = await claudeClient.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature,
          messages: [
            ...(context ? [{ role: 'user' as const, content: context }] : []),
            { role: 'user' as const, content: prompt },
          ],
        });
        result = editorResponse.content[0].type === 'text' 
          ? editorResponse.content[0].text 
          : '';
        break;
      
      default:
        throw new Error(`Unknown model role: ${role}`);
    }

    // Cache the result for 1 hour
    await setCached(cacheKey, result, 3600);

    return result;
  } catch (error) {
    console.error(`Error generating with ${role}:`, error);
    throw error;
  }
}

