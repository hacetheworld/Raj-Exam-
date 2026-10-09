import { describe, it, expect } from 'vitest';
import { urlHash, jaccardSimilarity, dedupe } from '../scraper/dedupe.js';

describe('dedupe utils', () => {
  it('generates deterministic url hashes ignoring trailing slash and query params', () => {
    const hash1 = urlHash('https://example.com/news/1');
    const hash2 = urlHash('https://example.com/news/1/');
    const hash3 = urlHash('https://example.com/news/1?utm_source=rss#top');
    expect(hash1).toBe(hash2);
    expect(hash1).toBe(hash3);
  });

  it('calculates jaccard similarity', () => {
    const sim = jaccardSimilarity('Rajasthan budget 2026 announced', 'Rajasthan budget 2026 announced today');
    expect(sim).toBeGreaterThan(0.7);
  });

  it('deduplicates items by URL hash and title similarity', () => {
    const items = [
      { url: 'https://example.com/a', title: 'Rajasthan budget 2026 announced by CM' },
      { url: 'https://example.com/a/', title: 'Different title same URL' },
      { url: 'https://example.com/b', title: 'Rajasthan budget 2026 announced by CM' },
      { url: 'https://example.com/c', title: 'Completely new story about REET exam' },
    ];

    const result = dedupe(items);
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://example.com/a');
    expect(result[1].url).toBe('https://example.com/c');
  });
});
