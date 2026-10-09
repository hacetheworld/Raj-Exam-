import { supabase } from '../config/supabase.js';
import { urlHash } from '../scraper/dedupe.js';

export async function getDigestByDate(date) {
  const { data, error } = await supabase
    .from('digests')
    .select('*')
    .eq('digest_date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertProcessingDigest(date) {
  const { data, error } = await supabase
    .from('digests')
    .upsert(
      {
        digest_date: date,
        status: 'processing',
        error_message: null,
      },
      { onConflict: 'digest_date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markDigestFailed(digestId, errorMessage) {
  const { error } = await supabase
    .from('digests')
    .update({
      status: 'failed',
      error_message: errorMessage,
    })
    .eq('id', digestId);

  if (error) throw error;
}

export async function replaceSourceItems(digestId, items) {
  await supabase.from('source_items').delete().eq('digest_id', digestId);

  if (!items || items.length === 0) return;

  const rows = items.map((item) => ({
    digest_id: digestId,
    source_id: item.source_id,
    url: item.url,
    url_hash: urlHash(item.url),
    title: item.title,
    body: item.body,
    published_at: item.published_at,
  }));

  const { error } = await supabase.from('source_items').insert(rows);
  if (error) throw error;
}

export async function publishDigest({ digestId, title, scriptText, llmModel, ttsModel, audioPath, questions }) {
  const { error } = await supabase.rpc('publish_digest', {
    p_digest_id: digestId,
    p_title: title,
    p_script: scriptText,
    p_llm_model: llmModel,
    p_tts_model: ttsModel,
    p_audio_path: audioPath,
    p_questions: questions,
  });

  if (error) throw error;
}

export async function setAudioPath(digestId, audioPath) {
  const { error } = await supabase
    .from('digests')
    .update({ audio_path: audioPath })
    .eq('id', digestId);

  if (error) throw error;
}

export async function startRun(date) {
  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert({
      digest_date: date,
      status: 'running',
      step: 'start',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRunStep(runId, step) {
  const { error } = await supabase
    .from('pipeline_runs')
    .update({ step })
    .eq('id', runId);

  if (error) throw error;
}

export async function finishRun(runId, { status, step, errorMessage = null }) {
  const { error } = await supabase
    .from('pipeline_runs')
    .update({
      status,
      step,
      error_message: errorMessage,
      finished_at: new Date().toISOString(),
    })
    .eq('id', runId);

  if (error) throw error;
}
