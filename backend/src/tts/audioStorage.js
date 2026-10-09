import { supabase } from '../config/supabase.js';
import { getPipelineEnv } from '../config/env.js';
import { withRetry, isTransient } from '../utils/retry.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export async function uploadAudio(date, buffer) {
  const env = getPipelineEnv();
  const path = `digests/${date}.mp3`;

  try {
    return await withRetry(
      async () => {
        const { error } = await supabase.storage
          .from(env.AUDIO_BUCKET)
          .upload(path, buffer, {
            contentType: 'audio/mpeg',
            upsert: true,
          });

        if (error) throw error;
        return path;
      },
      { retries: 2, label: 'uploadAudio', shouldRetry: isTransient }
    );
  } catch (err) {
    logger.error({ err: err.message, path }, 'Audio upload failed after retries');
    throw new AppError(502, 'UPLOAD_FAILED', 'Failed uploading audio file');
  }
}
