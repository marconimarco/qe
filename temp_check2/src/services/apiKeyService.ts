import { GoogleGenAI } from "@google/genai";

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('VITE_GEMINI_API_KEY');
    if (localKey && localKey.trim()) {
      return localKey.trim();
    }
  }

  // Fallback to env vars if defined
  let envKey = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    }
  } catch (e) {
    // Ignore error in non-vite environments
  }

  if (!envKey && typeof process !== 'undefined' && process.env) {
    envKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  }

  return envKey ? envKey.trim() : '';
}

export function saveApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    const trimmed = key.trim();
    localStorage.setItem('gemini_api_key', trimmed);
    localStorage.setItem('VITE_GEMINI_API_KEY', trimmed);
  }
}

export function removeApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('VITE_GEMINI_API_KEY');
  }
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
}
