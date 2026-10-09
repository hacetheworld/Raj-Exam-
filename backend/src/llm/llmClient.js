import { GoogleGenAI } from '@google/genai';
import { getPipelineEnv } from '../config/env.js';
import { withRetry, isTransient } from '../utils/retry.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export function modelName() {
  const env = getPipelineEnv();
  return env.GEMINI_MODEL;
}

export async function generateJson({ systemPrompt, userPrompt, responseSchema }) {
  const env = getPipelineEnv();
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  try {
    return await withRetry(
      async () => {
        const response = await ai.models.generateContent({
          model: env.GEMINI_MODEL,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.4,
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          },
        });

        const text = response.text;
        if (!text) throw new Error('Empty text from LLM response');
        return JSON.parse(text);
      },
      { retries: 2, label: 'llm-generateJson', shouldRetry: isTransient }
    );
  } catch (err) {
    logger.error({ err: err.message, model: env.GEMINI_MODEL }, 'LLM generation failed after retries');
    throw new AppError(502, 'LLM_FAILED', 'LLM generation failed');
  }
}
