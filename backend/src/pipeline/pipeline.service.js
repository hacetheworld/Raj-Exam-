import * as repo from './pipeline.repo.js';
import { scrapeAll } from '../scraper/index.js';
import { generateDigest } from '../llm/digestGenerator.js';
import { modelName } from '../llm/llmClient.js';
import { synthesizeSpeech } from '../tts/ttsClient.js';
import { uploadAudio } from '../tts/audioStorage.js';
import { getPipelineEnv } from '../config/env.js';
import { logger } from '../utils/logger.js';

export async function runPipeline({ date, force = false, dryRun = false }) {
  const startTime = Date.now();
  const env = getPipelineEnv();
  logger.info({ date, force, dryRun }, 'Starting pipeline run');

  // Step 1: Check
  const existingDigest = await repo.getDigestByDate(date);
  let audioOnlyRepair = false;

  if (existingDigest && existingDigest.status === 'ready') {
    if (existingDigest.audio_path && !force) {
      logger.info({ date }, 'Digest already ready with audio. Skipping pipeline.');
      return { status: 'already_done', date };
    }
    if (!existingDigest.audio_path && !force) {
      logger.info({ date }, 'Digest is ready but missing audio. Running audio repair mode.');
      audioOnlyRepair = true;
    }
  }

  // Dry run path
  if (dryRun) {
    logger.info('Dry run mode enabled');
    const items = await scrapeAll();
    if (items.length < env.PIPELINE_MIN_ITEMS) {
      throw new Error(`NOT_ENOUGH_ITEMS: Found ${items.length}, minimum is ${env.PIPELINE_MIN_ITEMS}`);
    }
    const digestResult = await generateDigest(items, date);
    console.log('DRY RUN RESULT:\n', JSON.stringify(digestResult, null, 2));
    return { status: 'dry_run_success', result: digestResult };
  }

  let currentStep = 'start';
  let pipelineRun = null;
  let digestId = existingDigest?.id;

  try {
    // Audio-only repair path
    if (audioOnlyRepair) {
      pipelineRun = await repo.startRun(date);
      currentStep = 'tts';
      await repo.updateRunStep(pipelineRun.id, 'tts');

      let audioPath = null;
      try {
        const mp3Buffer = await synthesizeSpeech(existingDigest.script_text);
        currentStep = 'upload';
        await repo.updateRunStep(pipelineRun.id, 'upload');
        audioPath = await uploadAudio(date, mp3Buffer);
      } catch (audioErr) {
        logger.warn({ err: audioErr.message }, 'Audio repair failed, keeping digest without audio');
      }

      if (audioPath) {
        await repo.setAudioPath(digestId, audioPath);
      }

      await repo.finishRun(pipelineRun.id, { status: 'succeeded', step: 'finish' });
      const durationMs = Date.now() - startTime;
      logger.info({ date, status: 'succeeded', audio: Boolean(audioPath), durationMs }, 'Audio repair completed');
      return { status: 'succeeded', date };
    }

    // Full Pipeline Path
    const digestRow = await repo.upsertProcessingDigest(date);
    digestId = digestRow.id;

    pipelineRun = await repo.startRun(date);

    // Step 3: Scrape
    currentStep = 'scrape';
    await repo.updateRunStep(pipelineRun.id, 'scrape');
    const items = await scrapeAll();

    if (items.length < env.PIPELINE_MIN_ITEMS) {
      throw new Error(`NOT_ENOUGH_ITEMS: Scraped ${items.length} items, minimum is ${env.PIPELINE_MIN_ITEMS}`);
    }
    await repo.replaceSourceItems(digestId, items);

    // Step 4: Generate
    currentStep = 'generate';
    await repo.updateRunStep(pipelineRun.id, 'generate');
    const digestResult = await generateDigest(items, date);

    // Step 5 & 6: TTS & Upload
    currentStep = 'tts';
    await repo.updateRunStep(pipelineRun.id, 'tts');
    let audioPath = null;
    let ttsModelName = env.TTS_MODEL;

    try {
      const mp3Buffer = await synthesizeSpeech(digestResult.script);
      currentStep = 'upload';
      await repo.updateRunStep(pipelineRun.id, 'upload');
      audioPath = await uploadAudio(date, mp3Buffer);
    } catch (audioErr) {
      logger.warn({ err: audioErr.message }, 'TTS or Upload step failed, proceeding without audio');
      ttsModelName = null;
    }

    // Step 7: Publish
    currentStep = 'publish';
    await repo.updateRunStep(pipelineRun.id, 'publish');
    await repo.publishDigest({
      digestId,
      title: digestResult.title,
      scriptText: digestResult.script,
      llmModel: modelName(),
      ttsModel: ttsModelName,
      audioPath,
      questions: digestResult.questions,
    });

    // Step 8: Finish
    currentStep = 'finish';
    await repo.finishRun(pipelineRun.id, { status: 'succeeded', step: 'finish' });

    const durationMs = Date.now() - startTime;
    logger.info(
      { date, status: 'succeeded', itemsCount: items.length, audio: Boolean(audioPath), durationMs },
      'Pipeline completed successfully'
    );
    return { status: 'succeeded', date };
  } catch (err) {
    const errMsg = err.message || 'Pipeline failed';
    logger.error({ date, step: currentStep, err: errMsg }, 'Pipeline failed');

    if (digestId) {
      try {
        await repo.markDigestFailed(digestId, errMsg);
      } catch (dbErr) {
        logger.error({ err: dbErr.message }, 'Failed marking digest failed');
      }
    }

    if (pipelineRun) {
      try {
        await repo.finishRun(pipelineRun.id, { status: 'failed', step: currentStep, errorMessage: errMsg });
      } catch (dbErr) {
        logger.error({ err: dbErr.message }, 'Failed finishing pipeline run with failure');
      }
    }

    throw err;
  }
}
