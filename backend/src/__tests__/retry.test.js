import { describe, it, expect, vi } from 'vitest';
import { withRetry, isTransient } from '../utils/retry.js';

describe('withRetry', () => {
  it('succeeds on first attempt without retrying', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const res = await withRetry(fn, { retries: 2, baseMs: 10 });
    expect(res).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    let count = 0;
    const fn = vi.fn().mockImplementation(async () => {
      count++;
      if (count === 1) throw new Error('Network error');
      return 'success';
    });

    const res = await withRetry(fn, { retries: 2, baseMs: 10 });
    expect(res).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('detects transient HTTP status codes', () => {
    expect(isTransient({ status: 429 })).toBe(true);
    expect(isTransient({ status: 502 })).toBe(true);
    expect(isTransient({ status: 404 })).toBe(false);
  });
});
