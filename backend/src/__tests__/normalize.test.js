import { describe, it, expect } from 'vitest';
import { normalizeItem } from '../scraper/normalize.js';

describe('normalizeItem', () => {
  it('cleans HTML tags, whitespace, and truncates body', () => {
    const raw = {
      url: 'https://example.com/test',
      title: '<h1>Test Title &amp; Header</h1>',
      body: '<p>This is a test paragraph with <b>bold text</b> and <script>alert(1)</script> script tag.</p>',
      published_at: '2026-10-01T10:00:00Z',
    };
    const source = { id: 'test-src', name: 'Test Source', priority: 1 };

    const item = normalizeItem(raw, source);
    expect(item.title).toBe('Test Title & Header');
    expect(item.body).toContain('This is a test paragraph with bold text and script tag.');
    expect(item.body).not.toContain('<p>');
    expect(item.body).not.toContain('alert');
    expect(item.source_id).toBe('test-src');
    expect(item.published_at).toBe('2026-10-01T10:00:00.000Z');
  });
});
