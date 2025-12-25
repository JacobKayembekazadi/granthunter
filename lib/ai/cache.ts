import { getCached, setCached } from '@/lib/redis';

const CACHE_TTL = 3600; // 1 hour

export async function getCachedAIResponse(key: string): Promise<string | null> {
  return getCached<string>(`ai_response:${key}`);
}

export async function setCachedAIResponse(key: string, value: string): Promise<void> {
  await setCached(`ai_response:${key}`, value, CACHE_TTL);
}

export function generateCacheKey(role: string, prompt: string): string {
  // Create a hash-like key from the prompt
  const promptHash = Buffer.from(prompt)
    .toString('base64')
    .slice(0, 50)
    .replace(/[^a-zA-Z0-9]/g, '');
  return `${role}:${promptHash}`;
}

