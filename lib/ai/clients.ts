import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';

// Lazy initialization - only create clients when actually used
let _geminiClient: GoogleGenAI | null = null;
let _claudeClient: Anthropic | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!_geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY environment variable');
    }
    _geminiClient = new GoogleGenAI({ apiKey });
  }
  return _geminiClient;
}

export function getClaudeClient(): Anthropic {
  if (!_claudeClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }
    _claudeClient = new Anthropic({ apiKey });
  }
  return _claudeClient;
}

// Export proxies for backward compatibility
export const geminiClient = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    const client = getGeminiClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as GoogleGenAI;

export const claudeClient = new Proxy({} as Anthropic, {
  get(_target, prop) {
    const client = getClaudeClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as Anthropic;

// DeepSeek Client (for Scout alternative)
// Note: DeepSeek uses OpenAI-compatible API
export async function deepSeekRequest(prompt: string, options?: { model?: string }) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: options?.model || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

