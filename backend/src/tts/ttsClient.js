import OpenAI from 'openai';
import { getPipelineEnv } from '../config/env.js';
import { withRetry, isTransient } from '../utils/retry.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export async function synthesizeSpeech(text) {
  if (text.length > 4000) {
    throw new AppError(400, 'TEXT_TOO_LONG', 'Script text exceeds TTS character limit');
  }

  const env = getPipelineEnv();
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  try {
    return await withRetry(
      async () => {
        const mp3Response = await openai.audio.speech.create({
          model: env.TTS_MODEL,
          voice: env.TTS_VOICE,
          input: text,
          response_format: 'mp3',
        });
        const arrayBuffer = await mp3Response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      },
      { retries: 3, baseMs: 1000, label: 'tts-synthesizeSpeech', shouldRetry: isTransient }
    );
  } catch (err) {
    logger.error({ err: err.message }, 'TTS synthesis failed after retries');
    throw new AppError(502, 'TTS_FAILED', 'TTS generation failed');
  }
}
