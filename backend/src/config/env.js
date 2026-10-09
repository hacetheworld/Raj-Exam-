import 'dotenv/config';
import { z } from 'zod';

const base = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.string().default('info'),
  APP_TIMEZONE: z.string().default('Asia/Kolkata'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  AUDIO_BUCKET: z.string().default('audio'),
  BANNER_BUCKET: z.string().default('banners'),
});

const api = base.extend({
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url(),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().default(3600),
});

const pipeline = base.extend({
  GEMINI_API_KEY: z.string().min(10),
  GEMINI_MODEL: z.string().min(3),
  OPENAI_API_KEY: z.string().min(10),
  TTS_MODEL: z.string().default('tts-1'),
  TTS_VOICE: z.string().default('nova'),
  PIPELINE_MIN_ITEMS: z.coerce.number().default(3),
  PIPELINE_MAX_ITEMS: z.coerce.number().default(12),
  PIPELINE_LOOKBACK_HOURS: z.coerce.number().default(36),
  SCRAPER_USER_AGENT: z.string().min(5),
});

function load(schema) {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const names = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    console.error('Invalid or missing env vars: ' + names);
    process.exit(1);
  }
  return parsed.data;
}

let apiEnv, pipelineEnv;

export const getApiEnv = () => (apiEnv ??= load(api));
export const getPipelineEnv = () => (pipelineEnv ??= load(pipeline));
