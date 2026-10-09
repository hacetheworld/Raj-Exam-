import { createClient } from '@supabase/supabase-js';
import { getApiEnv } from './env.js';

const env = getApiEnv();

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
