import { supabase } from '../config/supabase.js';
import { getApiEnv } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

async function getLatestReadyDate() {
  const { data, error } = await supabase
    .from('digests')
    .select('digest_date')
    .eq('status', 'ready')
    .order('digest_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.digest_date;
}

export async function getReadyDigest(date) {
  const env = getApiEnv();

  const { data: digest, error: digestErr } = await supabase
    .from('digests')
    .select('*')
    .eq('digest_date', date)
    .eq('status', 'ready')
    .maybeSingle();

  if (digestErr || !digest) {
    const latestDate = await getLatestReadyDate();
    throw new AppError(404, 'DIGEST_NOT_FOUND', 'No digest available for this date', {
      latest_date: latestDate,
    });
  }

  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('*')
    .eq('digest_id', digest.id)
    .order('position', { ascending: true });

  if (qErr) {
    logger.error({ err: qErr, digestId: digest.id }, 'failed fetching digest questions');
    throw new AppError(500, 'INTERNAL_ERROR', 'Failed fetching questions');
  }

  let audioUrl = null;
  if (digest.audio_path) {
    const { data: signedData, error: signErr } = await supabase.storage
      .from(env.AUDIO_BUCKET)
      .createSignedUrl(digest.audio_path, env.SIGNED_URL_TTL_SECONDS);

    if (signErr) {
      logger.warn({ err: signErr, path: digest.audio_path }, 'failed signing audio URL');
    } else if (signedData?.signedUrl) {
      audioUrl = signedData.signedUrl;
    }
  }

  return {
    date: digest.digest_date,
    title: digest.title,
    script_text: digest.script_text,
    audio_url: audioUrl,
    questions: (questions || []).map((q) => ({
      id: q.id,
      position: q.position,
      question_text: q.question_text,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation,
    })),
  };
}
