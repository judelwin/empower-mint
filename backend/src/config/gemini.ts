import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(env.geminiApiKey);
  }

  return geminiClient;
}

export function isGeminiAvailable(): boolean {
  return !!env.geminiApiKey;
}

