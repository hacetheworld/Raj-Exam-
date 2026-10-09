import { logger } from './logger.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function withRetry(fn, { retries = 2, baseMs = 1000, label = 'operation', shouldRetry = () => true } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !shouldRetry(err)) throw err;
      const wait = baseMs * 2 ** attempt + Math.floor(Math.random() * 250);
      attempt += 1;
      logger.warn({ label, attempt, waitMs: wait, msg: err.message }, 'retrying');
      await sleep(wait);
    }
  }
}

export const isTransient = (err) => {
  const s = err.status || err.statusCode;
  return !s || s === 429 || s >= 500;
};
